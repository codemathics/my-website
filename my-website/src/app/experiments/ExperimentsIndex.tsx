"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { experiments } from "@/components/experiments/registry";
import { SPRING } from "@/components/experiments/shared";

export default function ExperimentsIndex() {
  // newest day first
  const items = [...experiments].reverse();

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
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={SPRING}
          >
            <Link href={`/experiments/${meta.slug}`} className="exp-card">
              <div className="exp-card-canvas">
                <div className="exp-card-preview">
                  <Component />
                </div>
              </div>
              <div className="exp-card-meta">
                <div className="exp-card-left">
                  <span className="exp-card-day">
                    day {String(meta.day).padStart(2, "0")}
                  </span>
                  <span className="exp-card-name">{meta.name}</span>
                </div>
                <span className="exp-tag">{meta.aesthetic}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
