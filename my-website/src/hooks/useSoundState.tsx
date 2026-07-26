"use client";

import { useEffect, useState } from "react";
import { sound, type SoundState } from "@/lib/sound/engine";

const INITIAL: SoundState = { enabled: true, active: false };

/* reads the ui-sound state and re-renders when it changes anywhere on the page.
   the initial value is the default rather than the stored one so the first
   client render still matches the server markup; the real value lands in the
   effect, one tick later. */
export default function useSoundState() {
  const [state, setState] = useState<SoundState>(INITIAL);

  useEffect(() => {
    sound.hydrate();
    setState(sound.getState());
    return sound.subscribe(setState);
  }, []);

  return state;
}
