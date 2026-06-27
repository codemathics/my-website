"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import Lottie from "lottie-react";
import Link from "next/link";
import { ShowcaseProject } from "@/data/projects";

interface ProjectShowcaseProps {
  projects: ShowcaseProject[];
}

/* remember the home scroll position when opening a project so a "Cancel" /
   browser-back from the case study returns the viewer exactly where they were
   (not the hero). consumed once on the next home mount. */
export function rememberHomeScroll() {
  const pc = document.querySelector(".page-container") as HTMLElement | null;
  if (!pc) return;
  try {
    sessionStorage.setItem("homeScroll", String(pc.scrollTop));
  } catch {}
}

/* heroicons (outline/stroke) — paint brush = design, video camera = videography */
function DesignIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.53086 16.1224C9.08517 15.0243 8.00801 14.25 6.75 14.25C5.09315 14.25 3.75 15.5931 3.75 17.25C3.75 18.4926 2.74262 19.5 1.49998 19.5C1.44928 19.5 1.39898 19.4983 1.34912 19.495C2.12648 20.8428 3.58229 21.75 5.24998 21.75C7.72821 21.75 9.73854 19.7467 9.74993 17.2711C9.74998 17.2641 9.75 17.2571 9.75 17.25C9.75 16.8512 9.67217 16.4705 9.53086 16.1224ZM9.53086 16.1224C10.7252 15.7153 11.8612 15.1705 12.9175 14.5028M7.875 14.4769C8.2823 13.2797 8.8281 12.1411 9.49724 11.0825M12.9175 14.5028C14.798 13.3141 16.4259 11.7362 17.6806 9.85406L21.5566 4.04006C21.6827 3.85093 21.75 3.6287 21.75 3.40139C21.75 2.76549 21.2345 2.25 20.5986 2.25C20.3713 2.25 20.1491 2.31729 19.9599 2.44338L14.1459 6.31937C12.2638 7.57413 10.6859 9.20204 9.49724 11.0825M12.9175 14.5028C12.2396 12.9833 11.0167 11.7604 9.49724 11.0825" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15.75 10.5L20.4697 5.78033C20.9421 5.30786 21.75 5.64248 21.75 6.31066V17.6893C21.75 18.3575 20.9421 18.6921 20.4697 18.2197L15.75 13.5M4.5 18.75H13.5C14.7426 18.75 15.75 17.7426 15.75 16.5V7.5C15.75 6.25736 14.7426 5.25 13.5 5.25H4.5C3.25736 5.25 2.25 6.25736 2.25 7.5V16.5C2.25 17.7426 3.25736 18.75 4.5 18.75Z" />
    </svg>
  );
}

/* ── mobile: individual project card with intersectionobserver entrance ── */

function MobileProjectCard({
  project,
}: {
  project: ShowcaseProject;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const lottieData = project.primaryLottie ?? null;

  const renderTitle = () => {
    const letters = project.name.split("").map((ch, i) => (
      <span
        key={i}
        className={`mobile-showcase-letter ${ch === " " ? "showcase-letter-space" : ""}`}
        style={{
          transitionDelay: visible ? `${0.35 + i * 0.03}s` : "0s",
        }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));
    return letters;
  };

  return (
    <div
      ref={cardRef}
      className={`mobile-project-card ${visible ? "mobile-project-visible" : ""}`}
    >
      {/* image */}
      <Link
        href={`/projects/${project.slug}`}
        className="mobile-project-image-link"
        onClick={rememberHomeScroll}
      >
        <div className="mobile-project-image">
          {lottieData ? (
            <div className="mobile-project-lottie">
              <Lottie animationData={lottieData} loop autoplay />
            </div>
          ) : project.primaryImage ? (
            <img
              src={project.primaryImage.src}
              alt={project.primaryImage.alt}
            />
          ) : null}
        </div>
      </Link>

      {/* highlights */}
      {project.highlights && project.highlights.length > 0 && (
        <div className="mobile-project-highlights">
          {project.highlights.map((h, index) => (
            <div
              key={h}
              className={`project-highlight ${
                project.slug === "coderabbit" && index === 0
                  ? "project-highlight-current"
                  : ""
              }`}
            >
              <span className="project-highlight-icon" />
              <span className="project-highlight-text">{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* title */}
      <div className="mobile-project-title">{renderTitle()}</div>

      {/* description */}
      <p className="mobile-project-description">{project.description}</p>
    </div>
  );
}

/* ── main showcase component ── */

function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const count = projects.length;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // desktop display state
  const [displayIndex, setDisplayIndex] = useState(0);
  const [panelRevealed, setPanelRevealed] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [clickIndicator, setClickIndicator] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  // refs for transition control
  const displayIndexRef = useRef(0);
  const targetIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const panelTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const rafRef = useRef<number>(0);
  const jumpingRef = useRef(false);
  const preloadedRef = useRef<HTMLImageElement[]>([]);

  // nav hover-intent: a tiny open delay debounces accidental sweeps, swaps are
  // instant once a card is already open, and a close grace keeps the card alive
  // while moving between ticks so it never flickers — feels lazy + intentional.
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);
  const hoveredNavRef = useRef<number | null>(null);
  const navOpenTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const navCloseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const openNavPreview = useCallback((i: number) => {
    hoveredNavRef.current = i;
    setHoveredNav(i);
  }, []);

  const handleNavEnter = useCallback(
    (i: number) => {
      clearTimeout(navCloseTimerRef.current);
      if (hoveredNavRef.current !== null) {
        openNavPreview(i); // a card is already open → swap straight to it
      } else {
        clearTimeout(navOpenTimerRef.current);
        navOpenTimerRef.current = setTimeout(() => openNavPreview(i), 60);
      }
    },
    [openNavPreview]
  );

  const handleNavLeave = useCallback(() => {
    clearTimeout(navOpenTimerRef.current);
    navCloseTimerRef.current = setTimeout(() => {
      hoveredNavRef.current = null;
      setHoveredNav(null);
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(navOpenTimerRef.current);
      clearTimeout(navCloseTimerRef.current);
    };
  }, []);

  // preload + decode every showcase image up front. scrolling DOWN never
  // flickered because the next project is already mounted as the blurred
  // secondary image (already decoded); scrolling UP swaps to a previous project
  // that isn't mounted, so it decoded mid-fade and flashed. warming the decode
  // cache makes every swap paint instantly in both directions.
  useEffect(() => {
    if (isMobile) return;
    preloadedRef.current = projects
      .map((p) => p.primaryImage?.src)
      .filter((s): s is string => Boolean(s))
      .map((src) => {
        const img = new window.Image();
        img.src = src;
        img.decode?.().catch(() => {});
        return img;
      });
  }, [isMobile, projects]);

  // entrance + reset (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPanelRevealed(true);
          panelTimerRef.current = setTimeout(
            () => setContentVisible(true),
            450
          );
        } else {
          clearTimeout(panelTimerRef.current);
          clearTimeout(exitTimerRef.current);
          clearTimeout(cooldownTimerRef.current);

          setPanelRevealed(false);
          setContentVisible(false);
          setIsExiting(false);
          setDisplayIndex(0);
          setDirection("up");
          setClickIndicator((p) => ({ ...p, visible: false }));

          displayIndexRef.current = 0;
          targetIndexRef.current = 0;
          isTransitioningRef.current = false;
          jumpingRef.current = false;
        }
      },
      { threshold: 0.05 }
    );
    const el = wrapperRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    setClickIndicator((p) => ({ ...p, visible: false }));
  }, [displayIndex]);

  const EXIT_DURATION = 320;
  const COOLDOWN = 60;

  // advance the displayed project exactly one step toward the scroll target.
  // stepping (never instant-jumping) keeps every transition single-section and
  // animated; the self-reschedule walks through multiple sections on a fast
  // scroll without ever overshooting the user's actual scroll position.
  const triggerTransition = useCallback(() => {
    const target = targetIndexRef.current;
    const cur = displayIndexRef.current;

    if (target === cur) {
      isTransitioningRef.current = false;
      return;
    }

    isTransitioningRef.current = true;
    const step = target > cur ? 1 : -1;
    const nextIdx = cur + step;
    setDirection(step > 0 ? "up" : "down");

    setContentVisible(false);
    setIsExiting(true);

    clearTimeout(exitTimerRef.current);
    clearTimeout(cooldownTimerRef.current);

    exitTimerRef.current = setTimeout(() => {
      displayIndexRef.current = nextIdx;

      flushSync(() => {
        setDisplayIndex(nextIdx);
        setIsExiting(false);
      });

      if (stickyRef.current) void stickyRef.current.offsetHeight;

      flushSync(() => {
        setContentVisible(true);
      });

      cooldownTimerRef.current = setTimeout(() => {
        triggerTransition();
      }, COOLDOWN);
    }, EXIT_DURATION);
  }, []);

  const handleScroll = useCallback(() => {
    if (jumpingRef.current) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const viewH = window.innerHeight;
    const scrollableHeight = wrapper.offsetHeight - viewH;
    if (scrollableHeight <= 0) return;

    const scrolled = Math.max(0, -rect.top);
    // each project owns exactly one viewport-height of scroll, and the snap
    // anchors land scroll on those boundaries, so the nearest whole step is the
    // target. round (not floor) flips at the halfway point for responsiveness.
    const targetIdx = Math.min(
      count - 1,
      Math.max(0, Math.round(scrolled / viewH))
    );

    if (targetIdx === targetIndexRef.current) return;
    targetIndexRef.current = targetIdx;

    if (!isTransitioningRef.current && targetIdx !== displayIndexRef.current) {
      triggerTransition();
    }
  }, [count, triggerTransition]);

  // jump straight to a project from the left nav. the sticky panel stays pinned
  // across the whole wrapper, so moving the scroll position is visually
  // seamless — we set it instantly (snapping to the target's snap point) and run
  // a single crossfade straight to the target instead of stepping through every
  // project. `jumpingRef` suppresses the scroll handler so it doesn't fight it.
  const jumpTo = useCallback(
    (i: number) => {
      const pc = document.querySelector(".page-container") as HTMLElement | null;
      if (!pc) return;
      if (i === displayIndexRef.current && i === targetIndexRef.current) return;

      jumpingRef.current = true;
      clearTimeout(exitTimerRef.current);
      clearTimeout(cooldownTimerRef.current);

      pc.scrollTop = (i + 1) * window.innerHeight;

      isTransitioningRef.current = true;
      setDirection(i > displayIndexRef.current ? "up" : "down");
      setContentVisible(false);
      setIsExiting(true);

      exitTimerRef.current = setTimeout(() => {
        displayIndexRef.current = i;
        targetIndexRef.current = i;

        flushSync(() => {
          setDisplayIndex(i);
          setIsExiting(false);
        });

        if (stickyRef.current) void stickyRef.current.offsetHeight;

        flushSync(() => {
          setContentVisible(true);
        });

        isTransitioningRef.current = false;
        jumpingRef.current = false;
      }, EXIT_DURATION);
    },
    [EXIT_DURATION]
  );

  // sync the starting project to the current scroll on mount. when returning
  // from a case study (scroll restored by the home page), this lands directly on
  // the project the viewer came from instead of stepping through from the first.
  useEffect(() => {
    if (isMobile) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const viewH = window.innerHeight;
    const scrolled = Math.max(0, -wrapper.getBoundingClientRect().top);
    const idx = Math.min(count - 1, Math.max(0, Math.round(scrolled / viewH)));
    if (idx !== displayIndexRef.current) {
      displayIndexRef.current = idx;
      targetIndexRef.current = idx;
      setDisplayIndex(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, count]);

  // desktop scroll listener
  useEffect(() => {
    if (isMobile) return;
    const pageContainer = document.querySelector(".page-container");
    if (!pageContainer) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(handleScroll);
    };

    pageContainer.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      pageContainer.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(exitTimerRef.current);
      clearTimeout(cooldownTimerRef.current);
      clearTimeout(panelTimerRef.current);
    };
  }, [handleScroll, isMobile]);

  /* ── mobile: individual scroll-snap project cards ── */
  if (isMobile) {
    return (
      <div className="mobile-projects-wrapper">
        {projects.map((project, i) => (
          <MobileProjectCard key={i} project={project} />
        ))}
      </div>
    );
  }

  /* ── desktop/tablet: sticky scroll-swap ── */
  const project = projects[displayIndex];
  const nextProject =
    displayIndex < count - 1 ? projects[displayIndex + 1] : null;

  const stickyClasses = [
    "project-showcase-sticky",
    panelRevealed ? "panel-revealed" : "",
    contentVisible ? "content-visible" : "",
    isExiting ? "content-exiting" : "",
    `dir-${direction}`,
  ]
    .filter(Boolean)
    .join(" ");

  const renderVisual = (
    p: ShowcaseProject,
    className: string
  ) => {
    const lottieData = p.primaryLottie ?? null;
    if (lottieData) {
      return (
        <div className={`${className} showcase-lottie`}>
          <Lottie animationData={lottieData} loop autoplay />
        </div>
      );
    }
    if (p.primaryImage) {
      return (
        <img
          src={p.primaryImage.src}
          alt={p.primaryImage.alt}
          className={className}
          decoding="sync"
          draggable={false}
        />
      );
    }
    return null;
  };

  return (
    <div
      ref={wrapperRef}
      className="project-showcase-wrapper"
      style={{ height: `${count * 100}vh` }}
    >
      {/* one scroll-snap anchor per project so a single gesture advances exactly
          one project; positioned every viewport-height down the tall wrapper. */}
      <div className="showcase-snap-anchors" aria-hidden="true">
        {projects.map((_, i) => (
          <span
            key={i}
            className="showcase-snap-anchor"
            style={{ top: `${i * 100}vh` }}
          />
        ))}
      </div>

      <div ref={stickyRef} className={stickyClasses}>
        <div className="showcase-panel-right" />

        {/* left-side jump navigator: a tick per project; hover reveals a glimpse,
            click jumps straight to it (notion-style minimap). */}
        <nav className="showcase-nav" aria-label="Jump to project">
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              className={`showcase-nav-item ${i === displayIndex ? "is-active" : ""} ${hoveredNav === i ? "is-preview-open" : ""}`}
              onClick={() => jumpTo(i)}
              onMouseEnter={() => handleNavEnter(i)}
              onMouseLeave={handleNavLeave}
              onFocus={() => openNavPreview(i)}
              onBlur={handleNavLeave}
              aria-label={p.name}
              aria-current={i === displayIndex ? "true" : undefined}
            >
              <span className="showcase-nav-line" />
              <span className="showcase-nav-preview" aria-hidden="true">
                <span className="showcase-nav-preview-thumb">
                  {p.primaryImage ? (
                    <img src={p.primaryImage.src} alt="" decoding="async" />
                  ) : null}
                </span>
                <span className="showcase-nav-preview-meta">
                  <span className="showcase-nav-preview-name">{p.name}</span>
                  <span className="showcase-nav-preview-icons">
                    {(p.disciplines ?? ["design"]).map((d) => (
                      <span
                        key={d}
                        className="showcase-nav-preview-icon"
                        title={d === "video" ? "Videography" : "Design"}
                      >
                        {d === "video" ? <VideoIcon /> : <DesignIcon />}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </nav>

        <div className="showcase-info">
          <p className="showcase-description">{project.description}</p>
          {project.highlights && project.highlights.length > 0 && (
            <div className="showcase-highlights">
              {project.highlights.map((h, index) => (
                <div
                  key={h}
                  className={`project-highlight ${
                    project.slug === "coderabbit" && index === 0
                      ? "project-highlight-current"
                      : ""
                  }`}
                >
                  <span className="project-highlight-icon" />
                  <span className="project-highlight-text">{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`showcase-mockups ${clickIndicator.visible ? "showcase-mockups-cursor-active" : ""}`}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            setClickIndicator({
              visible: true,
              x: e.clientX,
              y: e.clientY,
            });
          }}
          onPointerLeave={() =>
            setClickIndicator((p) => ({ ...p, visible: false }))
          }
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") {
              setClickIndicator((p) => ({ ...p, visible: false }));
              return;
            }
            setClickIndicator((p) => ({
              ...p,
              x: e.clientX,
              y: e.clientY,
              visible: true,
            }));
          }}
        >
          <Link
            href={`/projects/${project.slug}`}
            className="showcase-mockup-link"
            onClick={rememberHomeScroll}
          >
            <div className="showcase-mockup-stack">
              <div className="showcase-primary-wrap">
                {renderVisual(project, "showcase-img-primary")}
              </div>

              {nextProject && (
                <div className="showcase-secondary-wrap">
                  {renderVisual(nextProject, "showcase-img-secondary")}
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className="showcase-title-area">
          {project.name.split("").map((letter, i) => (
            <span
              key={`${displayIndex}-${i}`}
              className={`showcase-letter ${letter === " " ? "showcase-letter-space" : ""}`}
              style={{ transitionDelay: `${0.18 + i * 0.03}s` }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>

        <div
          className={`showcase-click-cursor ${clickIndicator.visible ? "visible" : ""}`}
          style={{
            left: clickIndicator.x,
            top: clickIndicator.y,
          }}
          aria-hidden="true"
        >
          <img
            src="/click-icon.svg"
            alt=""
            width={116}
            height={116}
            className="showcase-click-cursor-icon"
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProjectShowcase);
