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
  const { enabled, active, chosen } = useSoundState();
  const [hinting, setHinting] = useState(false);

  /* the bars ripple in a slow grey loop only for someone who has never picked a
     state and hasn't heard anything yet — at 20px it's the only thing that reads
     as "this is a sound control". a viewer who already chose sees their choice
     reported straight back instead, including after a refresh. */
  const inviting = enabled && !chosen && !active;
  /* showing a definite "on": lit bars in their waveform shape, nothing waving. */
  const settled = enabled && !inviting;

  useEffect(() => {
    if (!showLabel || !revealed || !inviting) return;
    /* say it once, a beat after the control arrives, then get out of the way. */
    const show = setTimeout(() => setHinting(true), 900);
    const hide = setTimeout(() => setHinting(false), 4600);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [showLabel, revealed, inviting]);

  const handleClick = () => {
    sound.press();
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
          style={{ "--bar-scale": settled ? scale : 0.14 } as React.CSSProperties}
        />
      ))}
    </svg>
  );

  /* the wording is the action, so it follows what's on screen: an invite says
     "sound on", a control already showing on offers to turn it off. */
  const label = settled ? "sound off" : "sound on";
  const state = `${inviting ? "is-idle" : ""} ${settled ? "is-on" : ""} ${hinting ? "is-hinting" : ""}`;

  if (variant === "row") {
    return (
      <button
        type="button"
        className={`nav-link sound-toggle sound-toggle-row ${state} ${className}`}
        onClick={handleClick}
        data-sound-control
        aria-pressed={settled}
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
      data-sound-control
      aria-pressed={settled}
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
