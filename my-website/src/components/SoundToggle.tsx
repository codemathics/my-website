"use client";

import React from "react";
import { sound } from "@/lib/sound/engine";
import useSoundEnabled from "@/hooks/useSoundEnabled";

/* four bars that stand up into a waveform when sound is on and flatten to a row
   of dots when it's off — same tick vocabulary as the project navigator. */
const BAR_SCALES = [0.45, 0.9, 0.62, 1];

interface SoundToggleProps {
  /* "row" is the full-width, labelled variant used inside the mobile menu. */
  variant?: "icon" | "row";
  className?: string;
  onToggle?: () => void;
}

export default function SoundToggle({
  variant = "icon",
  className = "",
  onToggle,
}: SoundToggleProps) {
  const enabled = useSoundEnabled();

  const handleClick = () => {
    sound.toggle();
    onToggle?.();
  };

  const icon = (
    <svg
      className="sound-toggle-svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {BAR_SCALES.map((scale, i) => (
        <rect
          key={i}
          className="sound-toggle-bar"
          x={2.5 + i * 4.4}
          y="3"
          width="2"
          height="14"
          rx="1"
          fill="currentColor"
          style={{ "--bar-scale": enabled ? scale : 0.14 } as React.CSSProperties}
        />
      ))}
    </svg>
  );

  const label = enabled ? "turn sound off" : "turn sound on";

  if (variant === "row") {
    return (
      <button
        type="button"
        className={`nav-link sound-toggle sound-toggle-row ${enabled ? "is-on" : ""} ${className}`}
        onClick={handleClick}
        aria-pressed={enabled}
        aria-label={label}
      >
        <span className="nav-link-inner">sound</span>
        {icon}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`sound-toggle ${enabled ? "is-on" : ""} ${className}`}
      onClick={handleClick}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
