/* ─── scroll sonification ────────────────────────────────
   turns scrolling into a run of detents, the way a trackpad or a digital crown
   clicks its way through a list.

   two signals are combined rather than one:

   • `wheel` tells us *who* is scrolling — a mouse notch and a trackpad swipe
     want very different sounds — and whether macos has entered its inertial
     momentum phase after the fingers lift.
   • `scroll` tells us how far the page *actually* moved. driving the ticks from
     real movement means overscrolling at the top/bottom of a page stays silent
     (nothing moved, so nothing clicks), and programmatic jumps — anchor links,
     the project navigator's instant scroll — don't fire either, because no wheel
     preceded them. */

import { sound, type ScrollSource } from "./engine";

/* a scroll counts as user-driven only if a wheel event happened this recently.
   generous enough to cover the tail of a css scroll-snap glide, short enough to
   exclude a scripted jump. */
const GESTURE_WINDOW = 260;

/* a pause this long ends the gesture: the accumulator and speed estimate reset
   so the next flick starts from silence instead of inheriting stale momentum. */
const IDLE_RESET = 280;

/* px of travel per detent when barely moving. the step grows with speed so a
   hard flick doesn't turn into a buzz. */
const BASE_STEP = 13;
const MAX_STEP = 150;

const TRACKPAD_MIN_GAP = 33;
const MOUSE_MIN_GAP = 40;

/* the inertial tail is quieter and sparser, so a flick audibly coasts to rest. */
const MOMENTUM_GAIN = 0.55;
const MOMENTUM_STEP = 1.4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pixelsFor(event: WheelEvent) {
  const scale =
    event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  return {
    x: event.deltaX * scale,
    y: event.deltaY * scale,
  };
}

function scrollPosition(target: EventTarget | null) {
  const element =
    target === document || target === window || target === document.body
      ? document.scrollingElement
      : (target as HTMLElement | null);
  if (!element || typeof element.scrollTop !== "number") return null;
  return { x: element.scrollLeft, y: element.scrollTop };
}

export function startScrollSonification() {
  if (typeof window === "undefined") return () => {};

  const positions = new WeakMap<EventTarget, { x: number; y: number }>();

  let source: ScrollSource = "trackpad";
  /* hysteresis, so one odd event can't flip the whole feel mid-gesture. */
  let sourceScore = 0;

  let lastWheelAt = -Infinity;
  let lastTickAt = -Infinity;
  let lastMoveAt = -Infinity;
  let lastWheelMagnitude = 0;
  let decaySteps = 0;
  let momentum = false;

  let accumulated = 0;
  let speed = 0;

  /* a mouse notch is a discrete thing: arm one detent per wheel event and let
     the first real movement fire it, which keeps latency low while still
     staying silent when the page has nothing left to scroll. */
  let armedNotch = 0;

  const classify = (event: WheelEvent, magnitude: number, gap: number) => {
    if (event.deltaMode !== 0) {
      sourceScore = clamp(sourceScore - 2, -3, 3);
    } else if (
      !Number.isInteger(event.deltaY) ||
      !Number.isInteger(event.deltaX) ||
      event.deltaX !== 0 ||
      magnitude < 24 ||
      gap < 20
    ) {
      /* fractional deltas, sideways movement, tiny steps and frame-rate cadence
         are all things a notched wheel cannot produce. */
      sourceScore = clamp(sourceScore + 1, -3, 3);
    } else if (magnitude >= 90) {
      sourceScore = clamp(sourceScore - 1, -3, 3);
    }
    source = sourceScore >= 0 ? "trackpad" : "mouse";
  };

  const onWheel = (event: WheelEvent) => {
    const now = performance.now();
    const gap = now - lastWheelAt;
    const { x, y } = pixelsFor(event);
    const magnitude = Math.abs(y) + Math.abs(x) * 0.6;

    if (gap > IDLE_RESET) {
      accumulated = 0;
      speed = 0;
      decaySteps = 0;
      momentum = false;
    }

    classify(event, magnitude, gap);

    /* macos keeps delivering wheel events after the fingers lift, with steadily
       shrinking deltas at frame cadence — a reliable tell for the coast phase. */
    if (magnitude <= lastWheelMagnitude * 1.05 && gap < 40) {
      decaySteps += 1;
      if (decaySteps >= 5) momentum = true;
    } else if (magnitude > lastWheelMagnitude * 1.3) {
      decaySteps = 0;
      momentum = false;
    }

    lastWheelMagnitude = magnitude;
    lastWheelAt = now;

    if (source === "mouse") armedNotch = Math.min(armedNotch + 1, 2);
  };

  const emit = (now: number) => {
    const minGap = source === "mouse" ? MOUSE_MIN_GAP : TRACKPAD_MIN_GAP;
    if (now - lastTickAt < minGap) return;
    lastTickAt = now;

    const loudness = clamp(0.22 + Math.sqrt(speed) / 38, 0.22, 1);
    const intensity = momentum ? loudness * MOMENTUM_GAIN : loudness;
    /* a few degrees of stereo wander keeps a long run of ticks from sounding
       like it is coming from a single point behind the screen. */
    sound.scrollTick(intensity, source, (Math.random() - 0.5) * 0.3);
  };

  const onScroll = (event: Event) => {
    const target = event.target;
    if (!target) return;
    const position = scrollPosition(target);
    if (!position) return;

    const previous = positions.get(target);
    positions.set(target, position);
    if (!previous) return;

    const dy = Math.abs(position.y - previous.y);
    const dx = Math.abs(position.x - previous.x);
    const travelled = Math.max(dy, dx) + Math.min(dy, dx) * 0.5;
    if (travelled < 0.5) return;

    const now = performance.now();
    if (now - lastWheelAt > GESTURE_WINDOW) return;

    const elapsed = clamp(now - lastMoveAt, 4, 120);
    lastMoveAt = now;
    const instant = (travelled / elapsed) * 1000;
    speed = speed === 0 ? instant : speed * 0.72 + instant * 0.28;

    if (armedNotch > 0) {
      armedNotch -= 1;
      accumulated = 0;
      emit(now);
      return;
    }
    if (source === "mouse") return;

    accumulated += travelled;
    let step = clamp(BASE_STEP + speed * 0.03, BASE_STEP, MAX_STEP);
    if (momentum) step *= MOMENTUM_STEP;

    if (accumulated < step) return;
    /* one detent per movement at most: banking ticks during a stutter would pay
       them all back in a single burst. */
    accumulated = 0;
    emit(now);
  };

  window.addEventListener("wheel", onWheel, { passive: true, capture: true });
  /* scroll events don't bubble, but they do capture — one listener on the
     document catches the page, the project column and every carousel. */
  document.addEventListener("scroll", onScroll, {
    passive: true,
    capture: true,
  });

  return () => {
    window.removeEventListener("wheel", onWheel, { capture: true });
    document.removeEventListener("scroll", onScroll, { capture: true });
  };
}
