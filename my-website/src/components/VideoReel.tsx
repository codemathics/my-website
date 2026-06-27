"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface ReelItem {
  id: string;
  title: string;
  description: string;
}

const REELS: ReelItem[] = [
  { id: "reel-1", title: "Design Process", description: "how i approach product design end-to-end" },
  { id: "reel-2", title: "Creative Direction", description: "behind the scenes of brand and motion work" },
  { id: "reel-3", title: "Building Products", description: "from zero to one — shipping real products" },
  { id: "reel-4", title: "Motion Design", description: "bringing interfaces to life through animation" },
];

const R2_VIDEO_URL =
  "https://pub-4873d59bfaeb4c9a989299dc8a78df82.r2.dev/main.mp4";

export default function VideoReel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [projectSectionVisible, setProjectSectionVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState(R2_VIDEO_URL);
  const [videoReady, setVideoReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/api/config/reel-video")
      .then((r) => r.json())
      .then((data) => { if (data?.url) setVideoUrl(data.url); })
      .catch(() => {});
  }, []);

  // remember the user's minimize preference across pages/refreshes
  useEffect(() => {
    try {
      if (localStorage.getItem("reelMinimized") === "1") setMinimized(true);
    } catch {}
  }, []);

  const setMinimizedPersisted = useCallback((value: boolean) => {
    setMinimized(value);
    try {
      localStorage.setItem("reelMinimized", value ? "1" : "0");
    } catch {}
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/projects/")) {
      setVideoReady(true);
      return;
    }
    const el = document.getElementById("project-section");
    if (!el) {
      const t = setTimeout(() => setVideoReady(true), 1500);
      return () => clearTimeout(t);
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVideoReady(true); },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/projects/")) {
      setProjectSectionVisible(true);
      return;
    }
    if (pathname !== "/") {
      setProjectSectionVisible(false);
      return;
    }
    const el = document.getElementById("project-section");
    if (!el) { setProjectSectionVisible(false); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setProjectSectionVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  const shouldShow = pathname === "/" || pathname.startsWith("/projects/");

  useEffect(() => {
    const video = buttonVideoRef.current;
    if (!video) return;
    if (projectSectionVisible && !open) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [projectSectionVisible, open]);

  const handleOpen = useCallback(() => {
    buttonVideoRef.current?.pause();
    setOpen(true);
    setClosing(false);
    setActiveIndex(0);
    document.body.style.overflow = "hidden";
    setTimeout(() => setContentVisible(true), 50);
  }, []);

  const handleClose = useCallback(() => {
    setClosing(true);
    setContentVisible(false);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      document.body.style.overflow = "";
    }, 500);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setActiveIndex(Math.min(idx, REELS.length - 1));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [open]);

  const scrollToReel = useCallback((idx: number) => {
    scrollRef.current?.scrollTo({ top: idx * (scrollRef.current?.clientHeight ?? 0), behavior: "smooth" });
  }, []);

  if (!shouldShow) return null;

  return (
    <>
      <div
        className={`reel-dock ${projectSectionVisible ? "visible" : ""} ${minimized ? "minimized" : ""}`}
      >
        <button
          className="reel-button"
          onClick={handleOpen}
          aria-label="watch reels"
        >
          <div className="reel-button-video">
            {videoReady ? (
              <video
                ref={buttonVideoRef}
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
              />
            ) : (
              <div className="reel-button-video-placeholder" aria-hidden />
            )}
          </div>
          <div className="reel-button-overlay">
            <div className="reel-button-arrows">
              <svg width="24" height="24" viewBox="0 0 12 12" fill="none" className="reel-arrow reel-arrow-tr">
                <path d="M3 9L9 3" stroke="#E1D9D7" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4 3H9V8" stroke="#E1D9D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="24" height="24" viewBox="0 0 12 12" fill="none" className="reel-arrow reel-arrow-bl">
                <path d="M9 3L3 9" stroke="#E1D9D7" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 9H3V4" stroke="#E1D9D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {/* play glyph — only shown in the minimized bubble so it still reads
              as a watchable video */}
          <span className="reel-button-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.04-6.86a.5.5 0 0 0 0-.86L8.76 4.71A.5.5 0 0 0 8 5.14Z" />
            </svg>
          </span>
        </button>

        {minimized ? (
          <button
            className="reel-dock-action reel-dock-expand"
            onClick={() => setMinimizedPersisted(false)}
            aria-label="expand reel preview"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            className="reel-dock-action reel-dock-minimize"
            onClick={() => setMinimizedPersisted(true)}
            aria-label="minimize reel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="reel-modal-overlay">
          <div className={`reel-modal-panel ${contentVisible && !closing ? "visible" : ""} ${closing ? "closing" : ""}`}>
            <div className={`reel-modal-content ${contentVisible && !closing ? "visible" : ""} ${closing ? "closing" : ""}`}>
              <button
                className={`reel-modal-close ${contentVisible && !closing ? "visible" : ""} ${closing ? "closing" : ""}`}
                onClick={handleClose}
                aria-label="close reels"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <div className={`reel-modal-dots ${contentVisible && !closing ? "visible" : ""}`}>
                {REELS.map((_, i) => (
                  <button
                    key={i}
                    className={`reel-modal-dot ${i === activeIndex ? "reel-modal-dot-active" : ""}`}
                    onClick={() => scrollToReel(i)}
                    aria-label={`go to reel ${i + 1}`}
                  />
                ))}
              </div>

              <div className="reel-modal-scroll" ref={scrollRef}>
                {REELS.map((reel, i) => (
                  <div key={reel.id} className="reel-modal-item">
                    {i === activeIndex && (
                      <video
                        src={videoUrl}
                        autoPlay
                        loop
                        playsInline
                        controls
                        title={reel.title}
                      />
                    )}
                    <div className="reel-modal-item-info">
                      <p className="reel-modal-item-title">{reel.title}</p>
                      <p className="reel-modal-item-desc">{reel.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="reel-modal-esc-hint">
                press <kbd>esc</kbd> to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
