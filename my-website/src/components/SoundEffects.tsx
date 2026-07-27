"use client";

import { useEffect } from "react";
import { sound } from "@/lib/sound/engine";
import { startScrollSonification } from "@/lib/sound/scroll-sonifier";

/* events the browser accepts as a user gesture — audio cannot exist before one
   of these, so the audio graph is built on whichever arrives first. */
const ACTIVATION_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

/* mounted once in the root layout: owns the preference, the audio context and
   the global scroll ticks. renders nothing. */
export default function SoundEffects() {
  useEffect(() => {
    sound.hydrate();

    const create = (event: Event) => {
      /* the sound control is the one place a press must not quietly start audio
         on its own. its pointerdown arrives here before its click handler runs,
         so unlocking now would flip the control to "playing" and turn that same
         click into a mute — one press, and the viewer gets silence. */
      const target = event.target as Element | null;
      if (target?.closest?.("[data-sound-control]")) return;
      sound.unlock();
    };
    /* a wheel event is not a user gesture, so it can't *start* audio — but once
       the viewer has clicked anywhere it can wake a context that was suspended
       while sound was off. */
    const wake = () => sound.resume();

    ACTIVATION_EVENTS.forEach((type) =>
      window.addEventListener(type, create, { passive: true })
    );
    window.addEventListener("wheel", wake, { passive: true });

    const stop = startScrollSonification();

    return () => {
      ACTIVATION_EVENTS.forEach((type) =>
        window.removeEventListener(type, create)
      );
      window.removeEventListener("wheel", wake);
      stop();
    };
  }, []);

  return null;
}
