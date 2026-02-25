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

/* ── mobile: individual project card with IntersectionObserver entrance ── */

function MobileProjectCard({
  project,
  index,
  gatewayLottie,
}: {
  project: ShowcaseProject;
  index: number;
  gatewayLottie: object | null;
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

  const lottieData =
    project.primaryLottie ?? (index === 0 ? gatewayLottie : null);

  const renderTitle = () => {
    const letters = project.name.split("").map((ch, i) => (
      <span
        key={i}
        className="mobile-showcase-letter"
        style={{
          transitionDelay: visible ? `${0.35 + i * 0.03}s` : "0s",
        }}
      >
        {ch}
      </span>
    ));
    if (project.link) {
      return (
        <a href={project.link} target="_blank" rel="noopener noreferrer">
          {letters}
        </a>
      );
    }
    return <>{letters}</>;
  };

  return (
    <div
      ref={cardRef}
      className={`mobile-project-card ${visible ? "mobile-project-visible" : ""}`}
    >
      {/* image */}
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

      {/* highlights */}
      {project.highlights && project.highlights.length > 0 && (
        <div className="mobile-project-highlights">
          {project.highlights.map((h) => (
            <div key={h} className="project-highlight">
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

  const triggerTransition = useCallback((targetIdx: number) => {
    isTransitioningRef.current = true;

    const dir = targetIdx > displayIndexRef.current ? "up" : "down";
    setDirection(dir);

    setContentVisible(false);
    setIsExiting(true);

    clearTimeout(exitTimerRef.current);
    clearTimeout(cooldownTimerRef.current);

    exitTimerRef.current = setTimeout(() => {
      const finalTarget = targetIndexRef.current;

      if (finalTarget === displayIndexRef.current) {
        flushSync(() => {
          setIsExiting(false);
          setContentVisible(true);
        });
        isTransitioningRef.current = false;
        return;
      }

      displayIndexRef.current = finalTarget;

      flushSync(() => {
        setDisplayIndex(finalTarget);
        setIsExiting(false);
      });

      if (stickyRef.current) void stickyRef.current.offsetHeight;

      flushSync(() => {
        setContentVisible(true);
      });

      cooldownTimerRef.current = setTimeout(() => {
        isTransitioningRef.current = false;

        if (targetIndexRef.current !== displayIndexRef.current) {
          triggerTransition(targetIndexRef.current);
        }
      }, 200);
    }, 620);
  }, []);

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

    if (targetIdx === displayIndexRef.current) {
      if (isTransitioningRef.current) {
        clearTimeout(exitTimerRef.current);
        clearTimeout(cooldownTimerRef.current);

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

  // preload BLOCKRADAR Lottie
  const [gatewayLottie, setGatewayLottie] = useState<object | null>(null);
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const mod = await import("../../public/gateway.json");
        if (!cancelled) setGatewayLottie(mod.default);
        return;
      } catch {
        /* fallback */
      }

      try {
        const res = await fetch("/gateway.json");
        const data = await res.json();
        if (!cancelled) setGatewayLottie(data);
      } catch {
        /* keep usable */
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── mobile: individual scroll-snap project cards ── */
  if (isMobile) {
    return (
      <div className="mobile-projects-wrapper">
        {projects.map((project, i) => (
          <MobileProjectCard
            key={i}
            project={project}
            index={i}
            gatewayLottie={gatewayLottie}
          />
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
    className: string,
    isCurrent = false
  ) => {
    const lottieData =
      p.primaryLottie ?? (isCurrent && displayIndex === 0 ? gatewayLottie : null);
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

  const isOverTitleLetters = (e: React.PointerEvent) => {
    const area = e.currentTarget;
    const first = area.firstElementChild;
    if (!first) return false;
    const target = e.target as Node;
    if (first.tagName === "A") return first.contains(target);
    return (
      (e.target as Element).classList?.contains("showcase-letter") ?? false
    );
  };

  return (
    <div
      ref={wrapperRef}
      className="project-showcase-wrapper"
      style={{ height: `${count * 100}vh` }}
    >
      <div ref={stickyRef} className={stickyClasses}>
        <div className="showcase-panel-right" />

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

        <div className="showcase-mockups">
          <div className="showcase-mockup-stack">
            <div className="showcase-primary-wrap">
              {renderVisual(project, "showcase-img-primary", true)}
            </div>

            {nextProject && (
              <div className="showcase-secondary-wrap">
                {renderVisual(nextProject, "showcase-img-secondary")}
              </div>
            )}
          </div>
        </div>

        <div
          className={`showcase-title-area ${clickIndicator.visible ? "showcase-title-area-cursor-active" : ""}`}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            if (!isOverTitleLetters(e)) return;
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
            if (isOverTitleLetters(e)) {
              setClickIndicator((p) => ({
                ...p,
                x: e.clientX,
                y: e.clientY,
                visible: true,
              }));
            } else {
              setClickIndicator((p) => ({ ...p, visible: false }));
            }
          }}
        >
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
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
