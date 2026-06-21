"use client";

// day 01 - magnetic dock
// built from the codemathics design playground (iconAnimation frame). the icon
// under the cursor scales up huge, drops its border, and floats a little label
// above it. the rest gently blur back. as you sweep, the next icon reveals and
// the last one blurs. neighbours part to make room, the dock frame clears away
// while you hover, then everything reassembles once the cursor leaves. click and
// hold any icon to drag it into a new order. the whole dock scales to fit narrow
// screens.

import React, { useEffect, useRef, useState } from "react";
import { motion, Reorder, useAnimationControls } from "framer-motion";
import { DOCK_ICONS, type DockIcon } from "./dockIcons";

const ACCENT = "#5B8DEF";

const TILE = 48; // resting tile size, from figma
const GAP = 8; // figma gap
const PAD = 8.5; // figma dock padding
const PITCH = TILE + GAP; // distance between tile centres
const NATURAL_W = DOCK_ICONS.length * TILE + (DOCK_ICONS.length - 1) * GAP + PAD * 2;

// springs - snappy for movement, soft + delayed for the blur reveal.
const MOVE = { type: "spring" as const, stiffness: 320, damping: 22, mass: 0.7 };
const FRAME = { type: "spring" as const, stiffness: 260, damping: 26 };
const FADE_IN = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };
const FADE_OUT = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay: 0.06 };

export default function MagneticDock() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<DockIcon[]>(DOCK_ICONS);
  const [focus, setFocus] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const draggingRef = useRef(false);
  const hovering = focus !== null && draggingId === null;

  // shrink the dock to fit on narrow screens. measure the constraining parent
  // (the stage), not the wrap - the wrap's track stretches to the dock's natural
  // width and would never report being too small.
  useEffect(() => {
    const container = wrapRef.current?.parentElement;
    const measure = () => {
      const avail = container?.clientWidth ?? wrapRef.current?.clientWidth ?? NATURAL_W;
      const s = Math.min(1, (avail - 16) / NATURAL_W);
      scaleRef.current = s;
      setScale(s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (container) ro.observe(container);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // focus the nearest tile from fixed slot geometry - independent of the live
  // transforms, so growing tiles can't fight the hit-testing. divide by the dock
  // scale so detection stays correct when shrunk. suppressed while dragging.
  const track = (clientX: number) => {
    if (draggingRef.current) return;
    const row = rowRef.current;
    if (!row) return;
    const x = (clientX - row.getBoundingClientRect().left) / scaleRef.current;
    const idx = Math.round((x - PAD - TILE / 2) / PITCH);
    setFocus(Math.min(items.length - 1, Math.max(0, idx)));
  };

  return (
    <div className="md-wrap" ref={wrapRef}>
      <div
        className="md-dock"
        style={{ transform: `scale(${scale})` }}
        onPointerMove={(e) => track(e.clientX)}
        onPointerLeave={() => {
          if (!draggingRef.current) setFocus(null);
        }}
      >
        {/* the frame - border, fill, blur, shadow. scales out + clears while
            hovering so the big icons get room, then reassembles on leave. */}
        <motion.div
          className="md-frame"
          aria-hidden
          animate={{
            scale: hovering ? 1.14 : 1,
            opacity: hovering ? 0 : 1,
          }}
          transition={hovering ? FADE_IN : { ...FRAME, delay: 0.02 }}
        />

        <Reorder.Group
          as="div"
          axis="x"
          values={items}
          onReorder={setItems}
          className="md-row"
          ref={rowRef}
        >
          {items.map((icon, i) => (
            <DockButton
              key={icon.id}
              icon={icon}
              focused={focus === i && draggingId === null}
              dragging={draggingId === icon.id}
              dist={focus === null || draggingId !== null ? null : i - focus}
              onDragStart={() => {
                draggingRef.current = true;
                setDraggingId(icon.id);
                setFocus(null);
              }}
              onDragEnd={() => {
                draggingRef.current = false;
                setDraggingId(null);
              }}
            />
          ))}
        </Reorder.Group>
      </div>

      <p className="md-hint">sweep across the dock - hold and drag to rearrange</p>
      <style>{styles}</style>
    </div>
  );
}

function DockButton({
  icon,
  focused,
  dragging,
  dist,
  onDragStart,
  onDragEnd,
}: {
  icon: DockIcon;
  focused: boolean;
  dragging: boolean;
  dist: number | null; // signed distance from the focused tile, null when idle
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const labelControls = useAnimationControls();
  const idle = dist === null;
  const adist = dist === null ? 0 : Math.abs(dist);

  // neighbours slide outward to clear space for the huge focused tile.
  const shove = idle || focused ? 0 : Math.sign(dist!) * (20 / adist);
  // everything that isn't focused softens and blurs back.
  const blur = idle || focused ? 0 : Math.min(4, 1 + adist * 0.8);
  const opacity = idle ? 1 : focused ? 1 : Math.max(0.32, 0.7 - adist * 0.14);
  const scale = dragging ? 1.18 : focused ? 1.5 : 1;
  const lift = dragging ? -14 : focused ? -20 : 0;

  // a clean click (not a drag) makes the label squish then pop back.
  const bumpLabel = () =>
    labelControls.start(
      { scale: [1, 0.82, 1.12, 1] },
      { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    );

  return (
    <Reorder.Item
      as="div"
      value={icon}
      className="md-slot"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={{ zIndex: 30 }}
    >
      {/* inner layer carries the magnify shove so it never fights the drag/reorder
          transform that framer puts on the slot itself. */}
      <motion.div className="md-shove" animate={{ x: shove }} transition={MOVE}>
        {/* label tooltip - floats above the focused icon, never scales with it */}
        <div className="md-tip" aria-hidden>
          <motion.div
            className="md-tip-inner"
            initial={false}
            animate={focused || dragging ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={focused || dragging ? FADE_IN : FADE_OUT}
          >
            <motion.span className="md-tip-body" animate={labelControls}>
              {icon.label}
            </motion.span>
            <span className="md-tip-tail" />
          </motion.div>
        </div>

        <motion.button
          type="button"
          className="md-tile"
          aria-label={icon.label}
          animate={{
            y: lift,
            scale,
            // the stroke drops only on the active icon as it scales, and returns
            // on the way home. neighbours keep their border.
            borderColor: focused || dragging ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.14)",
            boxShadow: dragging
              ? "0 18px 40px rgba(0,0,0,0.5)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ default: MOVE, borderColor: { duration: 0.25 } }}
          whileTap={{ scale: focused ? 1.4 : 0.94 }}
          onTap={bumpLabel}
        >
          {/* soft glow blooms under the focused icon */}
          <motion.span
            className="md-glow"
            aria-hidden
            animate={{ opacity: focused || dragging ? 1 : 0 }}
            transition={focused || dragging ? FADE_IN : FADE_OUT}
          />
          <motion.span
            className="md-glyph"
            // the glyph itself animates on focus: a springy pop with a little wiggle.
            animate={{
              filter: `blur(${blur}px)`,
              opacity,
              scale: focused ? 1.08 : 1,
              rotate: focused ? [0, -7, 5, 0] : 0,
              color: focused || dragging ? "#ffffff" : "#d7d7d7",
            }}
            transition={{
              filter: focused ? FADE_IN : FADE_OUT,
              opacity: focused ? FADE_IN : FADE_OUT,
              scale: MOVE,
              rotate: { duration: 0.5, ease: "easeOut" },
              color: { duration: 0.3 },
            }}
          >
            <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              {icon.glyph}
            </svg>
          </motion.span>
        </motion.button>
      </motion.div>
    </Reorder.Item>
  );
}

const styles = `
.md-wrap {
  --accent: ${ACCENT};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}
.md-dock {
  position: relative;
  padding: 0;
  isolation: isolate;
  transform-origin: center center;
}
/* frame layer - the figma dock chrome, animated independently of the icons */
.md-frame {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 22px;
  border: 0.5px solid rgba(255,255,255,0.07);
  background: rgba(20,20,20,0.7);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  box-shadow:
    0 24px 60px 0 rgba(0,0,0,0.55),
    inset 0 1px 2px 0 rgba(44,44,44,0.6);
  transform-origin: center;
  pointer-events: none;
}
.md-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: ${GAP}px;
  padding: ${PAD}px;
  list-style: none;
  margin: 0;
}
.md-slot {
  position: relative;
  width: ${TILE}px;
  height: ${TILE}px;
  flex: none;
}
.md-shove {
  position: relative;
  width: 100%;
  height: 100%;
}
.md-tile {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0.5px solid rgba(255,255,255,0.14);
  border-radius: 14px;
  background: linear-gradient(160deg, #232323 0%, #141414 100%);
  cursor: grab;
  transform-origin: center bottom;
  /* no overflow clip - it was masking the icon strokes. the glow is a rounded,
     self-contained layer instead, so nothing gets cut. */
}
.md-tile:active { cursor: grabbing; }
.md-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* brighter blue toward the top, fading down and inward to nothing. a soft
     radial (not a blurred + clipped gradient) so there is no seam. */
  background: radial-gradient(
    78% 64% at 50% 16%,
    rgba(125,165,250,0.55) 0%,
    rgba(91,141,239,0.16) 45%,
    rgba(91,141,239,0) 72%
  );
  pointer-events: none;
  z-index: 0;
}
.md-glyph {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 60%;
  height: 60%;
  color: #d7d7d7;
}
.md-glyph svg { width: 100%; height: 100%; display: block; }
/* label tooltip */
.md-tip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 48px);
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 5;
}
.md-tip-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform, opacity;
}
.md-tip-body {
  background: #191a1a;
  color: #fff;
  font-family: 'Helvetica Now Display', Arial, Helvetica, sans-serif;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.168px;
  padding: 4px 6px;
  border-radius: 6px;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(0,0,0,0.4);
}
.md-tip-tail {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #191a1a;
  margin-top: -0.5px;
}
.md-hint {
  font-size: 13px;
  line-height: 19.5px;
  letter-spacing: 0.01em;
  color: #6a6a6a;
  font-family: 'Helvetica Now Display', Arial, Helvetica, sans-serif;
}
`;
