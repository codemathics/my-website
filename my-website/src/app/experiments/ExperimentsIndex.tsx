"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { experiments } from "@/components/experiments/registry";
import { SPRING } from "@/components/experiments/shared";

function ExperimentCard({
  href,
  hosted,
  children,
}: {
  href: string;
  hosted: boolean;
  children: React.ReactNode;
}) {
  // hosted apps are a vite spa behind a rewrite. a next <Link> would
  // client-navigate and 404, so those cards do a real document load.
  if (hosted) {
    return (
      <a href={href} className="exp-card">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="exp-card">
      {children}
    </Link>
  );
}

export default function ExperimentsIndex() {
  // newest day first
  const items = [...experiments].reverse();
  /* css media queries can't reach inside framer-motion, so the card entrances
     have to ask for themselves: the fade stays, the travel goes. */
  const reduceMotion = useReducedMotion();

  return (
    <main className="exp-shell">
      <header className="exp-head">
        <h1 className="exp-title">
          small components,
          <br />
          built to feel alive.
        </h1>
        <p className="exp-lede">
          designed the traditional way in figma, with the interactions shaped in
          rive or jitter, then built out in claude or cursor.
        </p>
        <p className="exp-count">
          {String(experiments.length).padStart(2, "0")} / 100 shipped
        </p>
      </header>

      <div className="exp-grid">
        {items.map(({ meta, Component }) => (
          <motion.div
            key={meta.slug}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={reduceMotion ? { duration: 0.2 } : SPRING}
          >
            <ExperimentCard href={meta.href ?? `/experiments/${meta.slug}`} hosted={Boolean(meta.href)}>
              <div className="exp-card-canvas">
                <div className="exp-card-preview">
                  <Component />
                </div>
              </div>
              <div className="exp-card-meta">
                <div className="exp-card-left">
                  <span className="exp-card-day">
                    {meta.kicker ?? `day ${String(meta.day).padStart(2, "0")}`}
                  </span>
                  <span className="exp-card-name">{meta.name}</span>
                </div>
                <span className="exp-tag">{meta.aesthetic}</span>
              </div>
            </ExperimentCard>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
