"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface ReelItem {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
}

const REELS: ReelItem[] = [
  {
    id: "reel-1",
    title: "Design Process",
    description: "how i approach product design end-to-end",
    embedUrl:
      "https://www.youtube.com/embed/yegZFhUHPmM?autoplay=1&mute=0&loop=1&controls=1&modestbranding=1&rel=0&playsinline=1&playlist=yegZFhUHPmM",
  },
  {
    id: "reel-2",
    title: "Creative Direction",
    description: "behind the scenes of brand and motion work",
    embedUrl:
      "https://www.youtube.com/embed/yegZFhUHPmM?autoplay=1&mute=0&loop=1&controls=1&modestbranding=1&rel=0&playsinline=1&playlist=yegZFhUHPmM",
  },
  {
    id: "reel-3",
    title: "Building Products",
    description: "from zero to one — shipping real products",
    embedUrl:
      "https://www.youtube.com/embed/yegZFhUHPmM?autoplay=1&mute=0&loop=1&controls=1&modestbranding=1&rel=0&playsinline=1&playlist=yegZFhUHPmM",
  },
  {
    id: "reel-4",
    title: "Motion Design",
    description: "bringing interfaces to life through animation",
    embedUrl:
      "https://www.youtube.com/embed/yegZFhUHPmM?autoplay=1&mute=0&loop=1&controls=1&modestbranding=1&rel=0&playsinline=1&playlist=yegZFhUHPmM",
  },
];

const YOUTUBE_VIDEO_ID = "yegZFhUHPmM";
const EMBED_VIDEO_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1&playlist=${YOUTUBE_VIDEO_ID}`;

export default function VideoReel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [projectSectionVisible, setProjectSectionVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // only show when in project section (homepage) or on case study pages
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
    if (!el) {
      setProjectSectionVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setProjectSectionVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  // keep button mounted on relevant pages so video stays cached (no reload on reveal/exit)
  const shouldShow =
    pathname === "/" || pathname.startsWith("/projects/");

  const handleOpen = useCallback(() => {
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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const itemHeight = el.clientHeight;
      const idx = Math.round(scrollTop / itemHeight);
      setActiveIndex(Math.min(idx, REELS.length - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [open]);

  const scrollToReel = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * el.clientHeight, behavior: "smooth" });
  }, []);

  if (!shouldShow) return null;

  return (
    <>
      {/* floating reel button with playing video — stays mounted to cache video state */}
      <button
        className={`reel-button ${projectSectionVisible ? "reel-button-visible" : ""}`}
        onClick={handleOpen}
        aria-label="watch reels"
      >
        <div className="reel-button-video">
          <iframe
            src={EMBED_VIDEO_URL}
            title="reel preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
      </button>

      {/* modal — same pattern as chat agent / city modals */}
      {open && (
        <div className="reel-modal-overlay">
          <div className={`reel-modal-panel ${contentVisible && !closing ? "visible" : ""} ${closing ? "closing" : ""}`}>
            <div className={`reel-modal-content ${contentVisible && !closing ? "visible" : ""} ${closing ? "closing" : ""}`}>
              {/* close button — same as chat modal */}
              <button
                className={`reel-modal-close ${contentVisible && !closing ? "visible" : ""} ${closing ? "closing" : ""}`}
                onClick={handleClose}
                aria-label="close reels"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* progress dots */}
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

              {/* scrollable reel area */}
              <div className="reel-modal-scroll" ref={scrollRef}>
                {REELS.map((reel, i) => (
                  <div key={reel.id} className="reel-modal-item">
                    {i === activeIndex && (
                      <iframe
                        src={reel.embedUrl}
                        title={reel.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                    <div className="reel-modal-item-info">
                      <p className="reel-modal-item-title">{reel.title}</p>
                      <p className="reel-modal-item-desc">{reel.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* esc hint */}
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
