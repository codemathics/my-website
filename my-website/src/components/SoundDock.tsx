"use client";

import { usePathname } from "next/navigation";
import SoundToggle from "@/components/SoundToggle";

/* the sound control everywhere the project rail isn't: a small companion to the
   chat bubble, stacked directly above it in the bottom-right corner. the home
   page carries its own at the head of the rail, so this stays out of the way
   there rather than putting two of them on screen. */
export default function SoundDock() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="sound-dock">
      <SoundToggle className="sound-dock-button" showLabel revealed />
    </div>
  );
}
