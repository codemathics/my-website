"use client";

import React from "react";
import Link from "next/link";
import { experiments } from "@/components/experiments/registry";

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
          <div key={meta.slug} className="exp-card-enter">
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
          </div>
        ))}
      </div>
    </main>
  );
}
