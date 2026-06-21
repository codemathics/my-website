"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ExperimentMeta } from "@/components/experiments/shared";

export default function ExperimentView({
  meta,
  fileName,
  forkUrl,
  figmaUrl,
  codeHtml,
  rawCode,
  prev,
  next,
  children,
}: {
  meta: ExperimentMeta;
  fileName: string;
  forkUrl: string;
  figmaUrl?: string;
  codeHtml: string;
  rawCode: string;
  prev?: ExperimentMeta;
  next?: ExperimentMeta;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked - no-op */
    }
  };

  return (
    <main className="exp-shell">
      <Link href="/experiments" className="exp-back">
        ← all experiments
      </Link>

      <div className="exp-detail-head">
        <div>
          <h1 className="exp-detail-title">{meta.name}</h1>
          <p className="exp-detail-desc">{meta.description}</p>
          <div className="exp-detail-meta">
            <span className="exp-detail-index">
              day {String(meta.day).padStart(2, "0")}
            </span>
            <span className="exp-tag">{meta.aesthetic}</span>
          </div>
        </div>
        <div className="exp-actions">
          <a
            href={forkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="exp-action"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" />
              <path d="M6 8.5v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2M12 13.5v2" />
            </svg>
            fork on github
          </a>
          {figmaUrl && (
            <a
              href={figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="exp-action"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8.5 2A3.5 3.5 0 0 0 8.5 9H12V2H8.5zM12 2v7h3.5a3.5 3.5 0 0 0 0-7H12zM8.5 9a3.5 3.5 0 1 0 0 7H12V9H8.5zM12 16h-.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 3.5-3.5V16H12zM15.5 9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
              </svg>
              copy in figma
            </a>
          )}
        </div>
      </div>

      {/* live, fully interactive component */}
      <section className="exp-stage" aria-label={`${meta.name} live demo`}>
        <div className="exp-stage-grain" aria-hidden />
        {children}
      </section>

      {/* source */}
      <section className="exp-code">
        <div className="exp-code-bar">
          <span className="exp-code-file">{fileName}</span>
          <button
            type="button"
            className="exp-copy"
            data-copied={copied}
            onClick={copy}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                copied
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
                copy
              </>
            )}
          </button>
        </div>
        <div
          className="exp-code-scroll"
          dangerouslySetInnerHTML={{ __html: codeHtml }}
        />
      </section>

      {/* prev / next */}
      <nav className="exp-nav">
        {prev ? (
          <Link
            href={`/experiments/${prev.slug}`}
            className="exp-nav-link"
            data-dir="prev"
          >
            <span className="exp-nav-dir">← day {String(prev.day).padStart(2, "0")}</span>
            <span className="exp-nav-name">{prev.name}</span>
          </Link>
        ) : (
          <span className="exp-nav-spacer" />
        )}
        {next ? (
          <Link
            href={`/experiments/${next.slug}`}
            className="exp-nav-link"
            data-dir="next"
          >
            <span className="exp-nav-dir">day {String(next.day).padStart(2, "0")} →</span>
            <span className="exp-nav-name">{next.name}</span>
          </Link>
        ) : (
          <span className="exp-nav-spacer" />
        )}
      </nav>
    </main>
  );
}
