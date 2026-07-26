"use client";

import React, { useEffect, useState } from "react";
import { sound } from "@/lib/sound/engine";
import useSoundState from "@/hooks/useSoundState";

/* four bars that stand up into a waveform when sound is playing and flatten to
   a row of dots when it's off — same tick vocabulary as the project navigator
   they sit above. */
const BAR_SCALES = [0.45, 0.9, 0.62, 1];

interface SoundToggleProps {
  /* "row" is the full-width, labelled variant used inside the mobile menu. */
  variant?: "icon" | "row";
  className?: string;
  /* reveals the wording beside the icon. off where there's no room to the
     right of the control, like the top-right of the navbar. */
  showLabel?: boolean;
  /* flips true once the control is actually on screen, which is when the
     one-time hint is worth spending. */
  revealed?: boolean;
  onToggle?: () => void;
}

export default function SoundToggle({
  variant = "icon",
  className = "",
  showLabel = false,
  revealed = false,
  onToggle,
}: SoundToggleProps) {
  const { enabled, active } = useSoundState();
  const [hinting, setHinting] = useState(false);

  /* while nothing can be heard the bars ripple in a slow grey loop, which is
     the only thing that reads as "this is a sound control" at 20px. it settles
     into the static waveform the moment sound is actually playing. */
  const idle = !active;

  useEffect(() => {
    if (!showLabel || !revealed || active) return;
    /* say it once, a beat after the rail arrives, then get out of the way. */
    const show = setTimeout(() => setHinting(true), 900);
    const hide = setTimeout(() => setHinting(false), 4600);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [showLabel, revealed, active]);

  const handleClick = () => {
    /* the preference can be on while the browser still hasn't let any audio
       through, and in that state a click means "start" — muting something the
       viewer has never heard would be a strange thing to do. */
    if (enabled && !active) void sound.start();
    else sound.toggle();
    setHinting(false);
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
          style={{ "--bar-scale": active ? scale : 0.14 } as React.CSSProperties}
        />
      ))}
    </svg>
  );

  const label = active ? "sound off" : "sound on";
  const state = `${idle ? "is-idle" : ""} ${active ? "is-on" : ""} ${hinting ? "is-hinting" : ""}`;

  if (variant === "row") {
    return (
      <button
        type="button"
        className={`nav-link sound-toggle sound-toggle-row ${state} ${className}`}
        onClick={handleClick}
        aria-pressed={active}
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
      className={`sound-toggle ${state} ${className}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      {icon}
      {showLabel && (
        <span className="sound-toggle-label" aria-hidden="true">
          {label}
        </span>
      )}
    </button>
  );
}
