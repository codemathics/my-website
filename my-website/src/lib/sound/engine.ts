/* ─── ui sound engine ────────────────────────────────────
   every sound is synthesised at runtime rather than loaded from a file: nothing
   to download, and each play can be detuned and re-shaped so a rapid run of
   ticks never sounds like the same sample looping.

   two ingredients, and which one leads decides the character:

   • a filtered noise burst — mechanical. this is the trackpad detent, the thing
     you feel more than hear.
   • a soft sine tone — musical. this carries the transitions, where a percussive
     hit would read as a drum beat rather than as one thing becoming another.

   both stay far below unity. nothing here should ever announce itself. */

export type ScrollSource = "trackpad" | "mouse";

export interface SoundState {
  /* the viewer's preference. */
  enabled: boolean;
  /* whether sound can actually be heard right now — enabled *and* past the
     browser's gesture requirement. the toggle advertises itself until this is
     true, because until then the site is silent whatever the preference says. */
  active: boolean;
}

type Listener = (state: SoundState) => void;

const STORAGE_KEY = "soundEnabled";

/* the single dial for how present the whole palette is — raise this if the ticks
   ever need to come forward. everything sits far below unity: measured at the
   master bus a scroll detent peaks near −43 dBFS and even a click only reaches
   about −34 dBFS. at that level the sounds read as texture under the room
   rather than as an interface talking back. */
const MASTER_LEVEL = 0.07;

/* a hard ceiling on simultaneous voices. a fast flick can request ticks faster
   than they decay, and stacked noise bursts turn into a hiss instead of a tick. */
const MAX_VOICES = 12;

/* long enough that even the slowest cue can start from a random offset and
   still have unused buffer left to run through. */
const NOISE_SECONDS = 1;

interface BurstSpec {
  /* ── noise layer (omit `gain` for a tone-only cue) ── */
  /* bandpass centre — the "material" of the tick. higher reads as glass or
     plastic, lower as wood. */
  frequency?: number;
  q?: number;
  /* peak gain before the per-play intensity scaling. */
  gain?: number;
  /* multiplies the noise buffer playback rate — cheap way to shift the grain. */
  rate?: number;

  /* ── tone layer ── */
  body?: number;
  bodyGain?: number;
  bodyDecay?: number;
  /* ratio the tone glides to across its life. a fall is what turns a tone into
     a drum hit, so this defaults to 1 — no glide, no beat. */
  bodyGlide?: number;
  /* an optional partial above the fundamental, as a ratio. a little of this
     keeps a soft sine from sounding like a test tone. */
  partial?: number;
  partialGain?: number;

  /* ── shared envelope ── */
  decay: number;
  /* time to reach peak. a near-instant attack reads as a sharp click; a few
     milliseconds turns the same burst into a soft pat, and tens of milliseconds
     turn it into a swell with no transient at all. */
  attack?: number;
  pan?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private voices = 0;

  private enabled = true;
  private hydrated = false;
  private listeners = new Set<Listener>();

  /* ── preference ──────────────────────────────────────── */

  isEnabled() {
    return this.enabled;
  }

  getState(): SoundState {
    return {
      enabled: this.enabled,
      active: this.enabled && this.ctx?.state === "running",
    };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  /* read the stored preference once, on the client. kept out of the constructor
     so the module stays inert during ssr and the first client render always
     matches the server markup. */
  hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;

    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {}

    if (stored === "on" || stored === "off") {
      this.setEnabled(stored === "on");
      return;
    }

    /* no explicit choice yet: someone who has asked the os to calm interfaces
       down almost certainly does not want a site chirping at them either. */
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.setEnabled(!calm);
  }

  setEnabled(next: boolean, persist = false) {
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {}
    }
    if (next === this.enabled) return;
    this.enabled = next;
    if (!next) this.suspend();
    this.emit();
  }

  toggle() {
    const next = !this.enabled;
    this.setEnabled(next, true);
    if (next) void this.start();
    return next;
  }

  /* let sound begin: called from a click, which is the gesture the browser has
     been waiting for. distinct from `toggle` because a viewer who has never
     touched the page still has the preference switched on — their click means
     "start", not "mute".

     the confirmation waits on resume: a context takes a moment to spin up, and
     anything scheduled before it is running is simply dropped. */
  async start() {
    this.setEnabled(true, true);
    this.unlock();
    try {
      await this.ctx?.resume();
    } catch {}
    this.confirm();
  }

  /* ── audio graph ─────────────────────────────────────── */

  /* browsers only let audio start from a real user gesture, so the context is
     built on the first pointer/key/wheel event rather than at import time —
     constructing it earlier just earns a console warning and a dead context. */
  unlock() {
    if (typeof window === "undefined") return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    if (!this.ctx) {
      try {
        this.ctx = new Ctor({ latencyHint: "interactive" });
      } catch {
        return;
      }

      const master = this.ctx.createGain();
      master.gain.value = MASTER_LEVEL;

      /* a gentle limiter. single sounds never reach the threshold; it exists to
         stop a fast flick's overlapping tails from stacking into a hiss. */
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -24;
      limiter.knee.value = 12;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.12;

      master.connect(limiter).connect(this.ctx.destination);
      this.master = master;
      /* the context can take a moment to actually start, and can be pulled out
         from under us by the os, so the audible state is reported from the
         context itself rather than assumed. */
      this.ctx.addEventListener("statechange", () => this.emit());
    }

    this.resume();
  }

  /* wake an already-built context without creating one — safe to call from
     events that aren't user gestures. */
  resume() {
    if (!this.ctx || !this.enabled) return;
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private suspend() {
    if (this.ctx && this.ctx.state === "running") void this.ctx.suspend();
  }

  private ready() {
    if (!this.enabled || !this.ctx || !this.master) return false;
    /* a suspended context still *accepts* scheduled sounds and fires them all at
       once when it wakes up, so bail rather than queue a burst of stale ticks. */
    if (this.ctx.state !== "running") {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return false;
    }
    return this.voices < MAX_VOICES;
  }

  private noiseBuffer(ctx: AudioContext) {
    if (this.noise) return this.noise;
    const length = Math.floor(ctx.sampleRate * NOISE_SECONDS);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;
    return buffer;
  }

  private play(spec: BurstSpec, intensity = 1) {
    if (!this.ready()) return;
    const ctx = this.ctx as AudioContext;
    const master = this.master as GainNode;

    const level = clamp(intensity, 0, 1);
    if (level <= 0.001) return;

    const t = ctx.currentTime;
    const decay = spec.decay;
    const attack = spec.attack ?? 0.0012;

    let output: AudioNode = master;
    if (spec.pan !== undefined && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = clamp(spec.pan, -1, 1);
      panner.connect(master);
      output = panner;
    }

    /* one play is one voice however many nodes it takes, released when the last
       of them finishes. */
    this.voices += 1;
    let pending = 0;
    const release = () => {
      pending -= 1;
      if (pending > 0) return;
      this.voices -= 1;
      if (output !== master) output.disconnect();
    };

    /* shapes the swell shared by both layers. exponential ramps can't touch
       zero, hence the near-silent floor at each end. */
    const shape = (param: AudioParam, peak: number, until: number) => {
      param.setValueAtTime(0.0001, t);
      param.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      param.exponentialRampToValueAtTime(0.0001, t + until);
    };

    if (spec.gain) {
      const source = ctx.createBufferSource();
      source.buffer = this.noiseBuffer(ctx);
      source.playbackRate.value = spec.rate ?? 1;

      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = spec.frequency ?? 1500;
      band.Q.value = spec.q ?? 1;

      const envelope = ctx.createGain();
      shape(envelope.gain, spec.gain * level, decay);
      source.connect(band).connect(envelope).connect(output);

      pending += 1;
      source.onended = () => {
        source.disconnect();
        band.disconnect();
        envelope.disconnect();
        release();
      };
      /* start from a random point in the buffer so consecutive ticks never
         share the same grain of noise. */
      source.start(t, Math.random() * (NOISE_SECONDS - decay - 0.02));
      source.stop(t + decay + 0.01);
    }

    if (spec.body) {
      const bodyDecay = spec.bodyDecay ?? decay;
      const glide = spec.bodyGlide ?? 1;
      const partials: Array<[number, number]> = [
        [spec.body, spec.bodyGain ?? (spec.gain ?? 0.1) * 0.5],
      ];
      if (spec.partial) {
        partials.push([
          spec.body * spec.partial,
          spec.partialGain ?? (spec.bodyGain ?? 0.1) * 0.14,
        ]);
      }

      for (const [frequency, peak] of partials) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, t);
        /* a downward glide is exactly how a kick drum is synthesised, so it is
           opt-in: only the cues that want to read as a physical knock use it. */
        if (glide !== 1) {
          osc.frequency.exponentialRampToValueAtTime(
            frequency * glide,
            t + bodyDecay
          );
        }

        const gain = ctx.createGain();
        shape(gain.gain, peak * level, bodyDecay);

        osc.connect(gain).connect(output);
        pending += 1;
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
          release();
        };
        osc.start(t);
        osc.stop(t + bodyDecay + 0.01);
      }
    }

    if (pending === 0) this.voices -= 1;
  }

  /* ── palette ─────────────────────────────────────────── */

  /* one notch of scroll. trackpad gestures fire these many times a second, so
     that variant is drier and shorter — closer to grain than to a click. a
     mouse wheel gets one slightly fuller detent per physical notch.

     both sit below 2khz on purpose: hearing peaks around 3–4khz, so a tick
     centred up there sounds twice as present as the meter says it is. */
  scrollTick(intensity: number, source: ScrollSource, pan = 0) {
    const wobble = 0.94 + Math.random() * 0.12;
    if (source === "mouse") {
      this.play(
        {
          frequency: 1320 * wobble,
          q: 1.4,
          gain: 0.24,
          decay: 0.035,
          attack: 0.0025,
          body: 220 * wobble,
          bodyGain: 0.04,
          bodyDecay: 0.028,
          bodyGlide: 0.72,
          rate: 1.1,
          pan,
        },
        intensity
      );
      return;
    }
    this.play(
      {
        frequency: 1700 * wobble,
        q: 1.8,
        gain: 0.2,
        decay: 0.016,
        attack: 0.004,
        rate: 1.35,
        pan,
      },
      intensity
    );
  }

  /* moving onto a new item in the left-hand project navigator. `step` walks the
     pitch up the list so sweeping the ticks plays a soft rising run. */
  navDetent(step = 0, intensity = 1) {
    const ratio = Math.pow(2, clamp(step, 0, 11) / 24);
    this.play(
      {
        frequency: 1680 * ratio,
        q: 2.6,
        gain: 0.14,
        decay: 0.026,
        attack: 0.003,
        body: 520 * ratio,
        bodyGain: 0.018,
        bodyDecay: 0.05,
        rate: 1.2,
      },
      intensity
    );
  }

  /* committing to something: nav click, dot click. */
  select() {
    this.play({
      frequency: 1500,
      q: 1.2,
      gain: 0.1,
      decay: 0.05,
      attack: 0.0025,
      body: 330,
      bodyGain: 0.018,
      bodyDecay: 0.11,
      bodyGlide: 0.72,
      rate: 1,
    });
  }

  /* the panel crossfading to another project.

     no noise layer and no pitch fall: a low sine sliding downward is how you
     synthesise a kick, and a transition that thumps reads as a beat rather than
     as one thing becoming another. this is a bare tone that blooms over ~100ms
     — there is no onset to hear, it is simply there — and then dissolves across
     the rest of the crossfade, so the cue lasts about as long as the image takes
     to arrive rather than marking the instant it does. the two directions are a
     fifth apart, so moving down the projects and back up sound related rather
     than identical. */
  swap(direction: "up" | "down" = "up") {
    this.play({
      body: direction === "up" ? 784 : 523,
      bodyGain: 0.1,
      bodyDecay: 0.44,
      /* a whisper of the octave above keeps the sine from sounding like a
         test tone without adding any edge. */
      partial: 2,
      partialGain: 0.012,
      attack: 0.1,
      decay: 0.44,
    });
  }

  /* a carousel/reel landing on a slide. */
  snap() {
    this.play({
      frequency: 1780,
      q: 2,
      gain: 0.16,
      decay: 0.045,
      attack: 0.003,
      body: 420,
      bodyGain: 0.02,
      bodyDecay: 0.07,
      bodyGlide: 0.82,
      rate: 1.05,
    });
  }

  /* played once when sound is switched on, so the control demonstrates itself:
     two soft tones a fifth apart, rising. same voice as the panel transition, so
     the first thing you hear is the palette introducing itself. */
  private confirm() {
    const note = (body: number) =>
      this.play({
        body,
        bodyGain: 0.085,
        bodyDecay: 0.24,
        partial: 2,
        partialGain: 0.01,
        attack: 0.035,
        decay: 0.24,
      });
    note(523);
    window.setTimeout(() => note(784), 120);
  }
}

export const sound = new SoundEngine();
