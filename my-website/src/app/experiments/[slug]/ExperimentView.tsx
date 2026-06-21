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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
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
                <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
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
