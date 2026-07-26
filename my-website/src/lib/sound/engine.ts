/* ─── ui sound engine ────────────────────────────────────
   every sound is synthesised at runtime from a short noise burst (+ an optional
   sine "body") rather than loaded from a file: nothing to download, and each
   play can be detuned/re-shaped so a rapid run of ticks never sounds like the
   same sample looping. the palette is deliberately tiny and quiet — the target
   is the mechanical detent of an apple trackpad/digital-crown scroll, something
   you feel more than hear. */

export type ScrollSource = "trackpad" | "mouse";

type Listener = (enabled: boolean) => void;

const STORAGE_KEY = "soundEnabled";

/* everything is mixed well below unity — these ticks should sit under whatever
   else the viewer is listening to, never on top of it. */
const MASTER_LEVEL = 0.34;

/* a hard ceiling on simultaneous voices. a fast flick can request ticks faster
   than they decay, and stacked noise bursts turn into a hiss instead of a tick. */
const MAX_VOICES = 12;

const NOISE_SECONDS = 0.35;

interface BurstSpec {
  /* bandpass centre — the "material" of the tick. higher reads as glass/plastic,
     lower as wood. */
  frequency: number;
  q: number;
  /* peak gain before the per-play intensity scaling. */
  gain: number;
  decay: number;
  /* optional sine thump underneath the noise; gives weight to selections. */
  body?: number;
  bodyGain?: number;
  bodyDecay?: number;
  /* multiplies the noise buffer playback rate — cheap way to shift the grain. */
  rate?: number;
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

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
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
    this.listeners.forEach((l) => l(next));
  }

  toggle() {
    const next = !this.enabled;
    this.setEnabled(next, true);
    if (next) {
      this.unlock();
      this.confirm();
    }
    return next;
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

      /* a gentle limiter: with detents this short, overlapping voices clip long
         before they get loud enough to notice individually. */
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -18;
      limiter.knee.value = 12;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.12;

      master.connect(limiter).connect(this.ctx.destination);
      this.master = master;
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

    let output: AudioNode = master;
    if (spec.pan !== undefined && ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = clamp(spec.pan, -1, 1);
      panner.connect(master);
      output = panner;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer(ctx);
    source.playbackRate.value = spec.rate ?? 1;
    /* start from a random point in the buffer so consecutive ticks never share
       the same grain of noise. */
    const offset = Math.random() * (NOISE_SECONDS - decay - 0.02);

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = spec.frequency;
    band.Q.value = spec.q;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, t);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, spec.gain * level),
      t + 0.0012
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    source.connect(band).connect(envelope).connect(output);

    this.voices += 1;
    source.onended = () => {
      this.voices -= 1;
      source.disconnect();
      band.disconnect();
      envelope.disconnect();
      if (output !== master) output.disconnect();
    };
    source.start(t, Math.max(0, offset));
    source.stop(t + decay + 0.01);

    if (!spec.body) return;

    const bodyDecay = spec.bodyDecay ?? decay;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(spec.body, t);
    /* a small downward glide is what makes a click read as a physical knock
       rather than a beep. */
    osc.frequency.exponentialRampToValueAtTime(spec.body * 0.72, t + bodyDecay);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, (spec.bodyGain ?? spec.gain * 0.5) * level),
      t + 0.004
    );
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + bodyDecay);

    osc.connect(bodyGain).connect(output);
    osc.onended = () => {
      osc.disconnect();
      bodyGain.disconnect();
    };
    osc.start(t);
    osc.stop(t + bodyDecay + 0.01);
  }

  /* ── palette ─────────────────────────────────────────── */

  /* one notch of scroll. trackpad gestures fire these many times a second, so
     that variant is softer, drier and pitched higher — closer to grain than to
     a click. a mouse wheel gets one crisper detent per physical notch. */
  scrollTick(intensity: number, source: ScrollSource, pan = 0) {
    const wobble = 0.94 + Math.random() * 0.12;
    if (source === "mouse") {
      this.play(
        {
          frequency: 1750 * wobble,
          q: 1.5,
          gain: 0.16,
          decay: 0.035,
          body: 220 * wobble,
          bodyGain: 0.05,
          bodyDecay: 0.028,
          rate: 1.1,
          pan,
        },
        intensity
      );
      return;
    }
    this.play(
      {
        frequency: 2450 * wobble,
        q: 2.4,
        gain: 0.085,
        decay: 0.019,
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
        frequency: 2100 * ratio,
        q: 3.2,
        gain: 0.1,
        decay: 0.026,
        body: 520 * ratio,
        bodyGain: 0.022,
        bodyDecay: 0.05,
        rate: 1.2,
      },
      intensity
    );
  }

  /* committing to something: nav click, dot click. */
  select() {
    this.play({
      frequency: 1900,
      q: 1.2,
      gain: 0.18,
      decay: 0.05,
      body: 330,
      bodyGain: 0.075,
      bodyDecay: 0.11,
      rate: 1,
    });
  }

  /* the panel crossfading to another project — a wider, airier version of the
     scroll tick so a section change feels heavier than a notch. */
  swap(direction: "up" | "down" = "up") {
    this.play({
      frequency: direction === "up" ? 1250 : 980,
      q: 0.9,
      gain: 0.09,
      decay: 0.14,
      body: direction === "up" ? 250 : 190,
      bodyGain: 0.045,
      bodyDecay: 0.16,
      rate: 0.55,
    });
  }

  /* a carousel/reel landing on a slide. */
  snap() {
    this.play({
      frequency: 2200,
      q: 2,
      gain: 0.12,
      decay: 0.045,
      body: 420,
      bodyGain: 0.03,
      bodyDecay: 0.07,
      rate: 1.05,
    });
  }

  /* played once when sound is switched on, so the toggle demonstrates itself. */
  private confirm() {
    this.play({
      frequency: 2400,
      q: 2.6,
      gain: 0.11,
      decay: 0.04,
      body: 660,
      bodyGain: 0.035,
      bodyDecay: 0.13,
      rate: 1.2,
    });
  }
}

export const sound = new SoundEngine();
