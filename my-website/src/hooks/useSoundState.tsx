"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound/engine";

/* reads the ui-sound preference and re-renders when it changes anywhere on the
   page. the initial value is the default rather than the stored one so the first
   client render still matches the server markup; the real value lands in the
   effect, one tick later. */
export default function useSoundEnabled() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    sound.hydrate();
    setEnabled(sound.isEnabled());
    return sound.subscribe(setEnabled);
  }, []);

  return enabled;
}
