"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
import Lottie from "lottie-react";

interface ProjectImage {
  src: string;
  alt: string;
}

export interface ShowcaseProject {
  name: string;
  description: string;
  primaryImage?: ProjectImage;
  primaryLottie?: object;
  link?: string;
  highlights?: string[];
}

interface ProjectShowcaseProps {
  projects: ShowcaseProject[];
}

function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const count = projects.length;

  // display state
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
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const panelTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rafRef = useRef<number>(0);

  // entrance + reset: observe when the showcase enters/leaves viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPanelRevealed(true);
          panelTimerRef.current = setTimeout(
            () => setContentVisible(true),
            450
          );
        } else {
          // left viewport — reset everything
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
        }
      },
      { threshold: 0.05 }
    );
    const el = wrapperRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // hide custom click cursor when the displayed project changes (so it doesn’t stick or show on wrong section)
  useEffect(() => {
    setClickIndicator((p) => ({ ...p, visible: false }));
  }, [displayIndex]);

  // trigger a project transition
  const triggerTransition = useCallback((targetIdx: number) => {
    isTransitioningRef.current = true;

    const dir = targetIdx > displayIndexRef.current ? "up" : "down";
    setDirection(dir);

    // phase 1: exit current content
    setContentVisible(false);
    setIsExiting(true);

    clearTimeout(exitTimerRef.current);
    clearTimeout(cooldownTimerRef.current);

    exitTimerRef.current = setTimeout(() => {
      const finalTarget = targetIndexRef.current;

      // edge case: user scrolled back to the current project
      // during the exit — just restore, no swap needed
      if (finalTarget === displayIndexRef.current) {
        flushSync(() => {
          setIsExiting(false);
          setContentVisible(true);
        });
        isTransitioningRef.current = false;
        return;
      }

      displayIndexRef.current = finalTarget;

      // phase 2: synchronous content swap — commits to DOM immediately
      flushSync(() => {
        setDisplayIndex(finalTarget);
        setIsExiting(false);
      });

      // force browser to compute styles for the hidden state
      // this locks in the "from" values for transitions
      // without ever painting the hidden frame to screen
      if (stickyRef.current) void stickyRef.current.offsetHeight;

      // phase 3: synchronous entrance trigger — also commits immediately
      // the browser never paints between phase 2 and phase 3
      flushSync(() => {
        setContentVisible(true);
      });

      // short grace period before allowing next transition
      cooldownTimerRef.current = setTimeout(() => {
        isTransitioningRef.current = false;

        // chain next transition if target drifted while animating
        if (targetIndexRef.current !== displayIndexRef.current) {
          triggerTransition(targetIndexRef.current);
        }
      }, 200);
    }, 620);
  }, []);

  // scroll handler — detect which project "page" we're on
  const handleScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const viewH = window.innerHeight;
    const scrollableHeight = wrapper.offsetHeight - viewH;
    if (scrollableHeight <= 0) return;

    const scrolled = Math.max(0, -rect.top);
    const rawProgress = Math.min(1, scrolled / scrollableHeight);

    const perProject = 1 / count;
    const targetIdx = Math.min(
      count - 1,
      Math.max(0, Math.floor(rawProgress / perProject))
    );

    targetIndexRef.current = targetIdx;

    // if user scrolled back to the currently displayed project,
    // cancel in-flight transition and smoothly restore content
    if (targetIdx === displayIndexRef.current) {
      if (isTransitioningRef.current) {
        clearTimeout(exitTimerRef.current);
        clearTimeout(cooldownTimerRef.current);

        // synchronous restore — goes directly from exit state
        // to visible state (CSS transition smoothly reverses)
        flushSync(() => {
          setIsExiting(false);
          setContentVisible(true);
        });

        isTransitioningRef.current = false;
      }
      return;
    }

    if (!isTransitioningRef.current) {
      triggerTransition(targetIdx);
    }
  }, [count, triggerTransition]);

  // listen to scroll on the page container
  useEffect(() => {
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
  }, [handleScroll]);

  const project = projects[displayIndex];
  const nextProject =
    displayIndex < count - 1 ? projects[displayIndex + 1] : null;

  // preload BLOCKRADAR Lottie once with a robust fallback path
  const [gatewayLottie, setGatewayLottie] = useState<object | null>(null);
  useEffect(() => {
    let cancelled = false;

    const loadGatewayLottie = async () => {
      try {
        const mod = await import("../../public/gateway.json");
        if (!cancelled) setGatewayLottie(mod.default);
        return;
      } catch {
        // fallback: fetch from /public in case module import is unavailable
      }

      try {
        const res = await fetch("/gateway.json");
        const data = await res.json();
        if (!cancelled) setGatewayLottie(data);
      } catch {
        // keep showcase usable even if Lottie fails to load
      }
    };

    loadGatewayLottie();
    return () => {
      cancelled = true;
    };
  }, []);

  // build class list
  const stickyClasses = [
    "project-showcase-sticky",
    panelRevealed ? "panel-revealed" : "",
    contentVisible ? "content-visible" : "",
    isExiting ? "content-exiting" : "",
    `dir-${direction}`,
  ]
    .filter(Boolean)
    .join(" ");

  // render a visual (lottie or image); BLOCKRADAR uses lazy-loaded gatewayLottie
  const renderVisual = (p: ShowcaseProject, className: string, isCurrent = false) => {
    const lottieData = p.primaryLottie ?? (isCurrent && displayIndex === 0 ? gatewayLottie : null);
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
        />
      );
    }
    return null;
  };

  // only treat hover as "over title letters" when target is inside the link or is a .showcase-letter (no-link case)
  const isOverTitleLetters = (e: React.PointerEvent) => {
    const area = e.currentTarget;
    const first = area.firstElementChild;
    if (!first) return false;
    const target = e.target as Node;
    if (first.tagName === "A") return first.contains(target);
    return (e.target as Element).classList?.contains("showcase-letter") ?? false;
  };

  return (
    <div
      ref={wrapperRef}
      className="project-showcase-wrapper"
      style={{ height: `${count * 100}vh` }}
    >
      <div ref={stickyRef} className={stickyClasses}>
        {/* dark right panel — grows from bottom to top */}
        <div className="showcase-panel-right" />

        {/* left: project info */}
        <div className="showcase-info">
          <p className="showcase-description">{project.description}</p>
          {project.highlights && project.highlights.length > 0 && (
            <div className="showcase-highlights">
              {project.highlights.map((h) => (
                <div key={h} className="project-highlight">
                  <span className="project-highlight-icon" />
                  <span className="project-highlight-text">{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* right: mockup images */}
        <div className="showcase-mockups">
          <div className="showcase-mockup-stack">
            {/* primary */}
            <div className="showcase-primary-wrap">
              {renderVisual(project, "showcase-img-primary", true)}
            </div>

            {/* secondary (next project preview, blurred) */}
            {nextProject && (
              <div className="showcase-secondary-wrap">
                {renderVisual(nextProject, "showcase-img-secondary")}
              </div>
            )}
          </div>
        </div>

        {/* title — custom cursor only when hovering the letters inside .showcase-title-area; anchors remain clickable */}
        <div
          className={`showcase-title-area ${clickIndicator.visible ? "showcase-title-area-cursor-active" : ""}`}
          onPointerEnter={(e) => {
            if (!isOverTitleLetters(e)) return;
            setClickIndicator({ visible: true, x: e.clientX, y: e.clientY });
          }}
          onPointerLeave={() =>
            setClickIndicator((p) => ({ ...p, visible: false }))
          }
          onPointerMove={(e) => {
            if (isOverTitleLetters(e)) {
              setClickIndicator((p) => ({ ...p, x: e.clientX, y: e.clientY, visible: true }));
            } else {
              setClickIndicator((p) => ({ ...p, visible: false }));
            }
          }}
        >
          {project.link ? (
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              {project.name.split("").map((letter, i) => (
                <span
                  key={`${displayIndex}-${i}`}
                  className="showcase-letter"
                  style={{ transitionDelay: `${0.18 + i * 0.03}s` }}
                >
                  {letter}
                </span>
              ))}
            </a>
          ) : (
            <>
              {project.name.split("").map((letter, i) => (
                <span
                  key={`${displayIndex}-${i}`}
                  className="showcase-letter"
                  style={{ transitionDelay: `${0.18 + i * 0.03}s` }}
                >
                  {letter}
                </span>
              ))}
            </>
          )}
        </div>

        {/* click cursor — follows pointer over project title (Figma design) */}
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
