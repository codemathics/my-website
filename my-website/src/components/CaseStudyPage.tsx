"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CaseStudySidebar from "@/components/CaseStudySidebar";
import CaseStudySection from "@/components/CaseStudySection";
import { CaseStudyData, getNextProject } from "@/data/projects";
import Link from "next/link";

interface CaseStudyPageProps {
  project: CaseStudyData;
}

function ImageCarousel({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const scrollTo = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    isScrollingRef.current = true;
    setActive(idx);
    const slide = track.children[idx] as HTMLElement;
    if (slide) {
      slide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    setTimeout(() => { isScrollingRef.current = false; }, 500);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || images.length === 0) return;

    const updateActiveFromScroll = () => {
      if (isScrollingRef.current) return;
      const slides = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const dist = Math.abs(center - slideCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });
      setActive(closestIdx);
    };

    track.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    updateActiveFromScroll();
    return () => track.removeEventListener("scroll", updateActiveFromScroll);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="cs-carousel">
      <div
        className="cs-carousel-track"
        ref={trackRef}
        style={{ touchAction: "pan-x" }}
      >
        {images.map((src, i) => (
          <div key={i} className="cs-carousel-slide">
            {src.startsWith("http") || src.startsWith("/") ? (
              <img src={src} alt="" className="cs-carousel-img" />
            ) : (
              <div className="cs-carousel-placeholder">
                <span>{`image ${i + 1}`}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="cs-carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`cs-carousel-dot ${i === active ? "cs-carousel-dot-active" : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CaseStudyPage({ project }: CaseStudyPageProps) {
  const router = useRouter();
  const next = getNextProject(project.slug);
  const [isMobile, setIsMobile] = useState(false);
  const [heroLottie, setHeroLottie] = useState<object | null>(null);
  const isWip = project.slug !== "blockradar";

  useEffect(() => {
    if (!isWip) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isWip, router]);

  useEffect(() => {
    if (project.heroLottieKey !== "br") return;
    let cancelled = false;
    fetch("/br.json")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setHeroLottie(d);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [project.heroLottieKey]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="cs-page">
      <Navbar showLogo showNav />
      {isWip && (
        <div className="cs-wip-overlay" role="dialog" aria-modal="true" aria-labelledby="cs-wip-title">
          <div className="cs-wip-content">
            <h2 id="cs-wip-title" className="cs-wip-title">Case study in progress</h2>
            <p className="cs-wip-message">
              This case study is currently a work in progress. Check back later or contact me for a demo.
            </p>
            <div className="cs-wip-actions">
              <button
                type="button"
                className="btn-primary cs-wip-cancel"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                Cancel
              </button>
              <Link href="/" className="cs-wip-link">
                Back to home
              </Link>
            </div>
            <p className="cs-wip-esc-hint">press <kbd>esc</kbd> to close</p>
          </div>
          <button
            type="button"
            className="cs-wip-overlay-close"
            onClick={() => router.back()}
            aria-label="Close (Esc)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* hero */}
      <div className="cs-hero">
        {heroLottie ? (
          <div className="cs-hero-bg cs-hero-lottie">
            <Lottie animationData={heroLottie} loop autoplay />
          </div>
        ) : project.heroImage ? (
          <div className="cs-hero-bg">
            <img src={project.heroImage} alt="" />
          </div>
        ) : null}
        <div className="cs-hero-gradient" />
        <div className="cs-hero-content">
          <h1 className="cs-hero-headline">{project.headline}</h1>
          <div className="cs-hero-meta">
            <span className="cs-hero-role">{project.role}</span>
            <span className="cs-hero-divider">/</span>
            <span className="cs-hero-timeline">{project.timeline}</span>
          </div>
        </div>
      </div>

      {/* mobile section pills */}
      {isMobile && <MobileSectionBar />}

      {/* body */}
      <div className="cs-body">
        {!isMobile && (
          <CaseStudySidebar
            projectName={project.name}
            logoIcon={project.logoIcon}
            logoWide={project.logoWide}
            nextProjectSlug={next?.slug}
            nextProjectName={next?.name}
          />
        )}

        <div className="cs-content">
          {/* tldr */}
          <CaseStudySection id="tldr">
            <span className="cs-eyebrow">tldr;</span>
            <h2 className="cs-heading">Overview</h2>
            {project.overviewImage && (
              <div className="cs-overview-image">
                <img src={project.overviewImage} alt="" />
              </div>
            )}
            <p className="cs-paragraph">
              {(() => {
                const phrase1 = "When you strip stablecoins down";
                const phrase2 = "That mindset carried through";
                const parts = project.overview.split(phrase1);
                if (parts.length === 1) return project.overview;
                const secondParts = parts[1].split(phrase2);
                if (secondParts.length === 1) {
                  return (
                    <>
                      {parts[0]}
                      <br />
                      <br />
                      {phrase1}
                      {parts[1]}
                    </>
                  );
                }
                return (
                  <>
                    {parts[0]}
                    <br />
                    <br />
                    {phrase1}
                    {secondParts[0]}
                    <br />
                    <br />
                    {phrase2}
                    {secondParts[1]}
                  </>
                );
              })()}
            </p>
            <div className="cs-meta-grid">
              <div className="cs-meta-item">
                <span className="cs-meta-label">role</span>
                <span className="cs-meta-value">{project.role}</span>
              </div>
              <div className="cs-meta-item">
                <span className="cs-meta-label">timeline</span>
                <span className="cs-meta-value">{project.timeline}</span>
              </div>
              <div className="cs-meta-item">
                <span className="cs-meta-label">team</span>
                {project.team.map((m) => (
                  <span key={m} className="cs-meta-value">
                    {m}
                  </span>
                ))}
              </div>
              <div className="cs-meta-item">
                <span className="cs-meta-label">skills</span>
                {project.skills.map((s) => (
                  <span key={s} className="cs-meta-value">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </CaseStudySection>

          {/* problem */}
          <CaseStudySection id="problem" className="cs-problem-section">
            <div className="cs-problem-card">
              <span className="cs-eyebrow">the problem</span>
              <h2 className="cs-heading">{project.problem.title}</h2>
              <p className="cs-paragraph">
                {(() => {
                  const phrase = "Boring meant predictable";
                  const idx = project.problem.description.indexOf(phrase);
                  if (idx === -1) return project.problem.description;
                  return (
                    <>
                      {project.problem.description.slice(0, idx)}
                      <br />
                      <br />
                      <span className="cs-emphasis-gochi">
                        {project.problem.description.slice(idx)}
                      </span>
                    </>
                  );
                })()}
              </p>
            </div>
          </CaseStudySection>

          {/* research */}
          <CaseStudySection id="research">
            <span className="cs-eyebrow">research</span>
            <h2 className="cs-heading">{project.research.title}</h2>
            <div className="cs-insight-grid">
              {project.research.insights.map((insight, i) => (
                <div key={i} className="cs-insight-card">
                  <div className="cs-insight-visual">
                    {insight.image ? (
                      <img src={insight.image} alt="" />
                    ) : (
                      <div className="cs-insight-placeholder">
                        <span>{`insight ${i + 1}`}</span>
                      </div>
                    )}
                  </div>
                  <p className="cs-insight-caption">{insight.caption}</p>
                </div>
              ))}
            </div>
          </CaseStudySection>

          {/* solution */}
          <CaseStudySection id="solution">
            <span className="cs-eyebrow">the solution</span>
            <h2 className="cs-heading">{project.solution.title}</h2>
            <div className="cs-solution-steps">
              {project.solution.steps.map((step, i) => (
                <div key={i} className="cs-solution-step">
                  <div className="cs-solution-visual">
                    {step.image ? (
                      <img src={step.image} alt="" />
                    ) : (
                      <div className="cs-solution-placeholder">
                        <span>{`step ${i + 1}`}</span>
                      </div>
                    )}
                  </div>
                  <div className="cs-solution-text">
                    <h3 className="cs-solution-step-title">{step.title}</h3>
                    <p className="cs-paragraph">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CaseStudySection>

          {/* learnings */}
          <CaseStudySection id="learnings">
            <span className="cs-eyebrow">learnings</span>
            <h2 className="cs-heading">{project.learnings.title}</h2>
            <ImageCarousel
              images={
                project.learnings.images && project.learnings.images.length > 0
                  ? project.learnings.images
                  : ["placeholder-1", "placeholder-2", "placeholder-3"]
              }
            />
            <div className="cs-learnings-list">
              {project.learnings.items.map((item, i) => (
                <div key={i} className="cs-learning-item">
                  <h3 className="cs-learning-title">{item.title}</h3>
                  <p className="cs-paragraph">{item.description}</p>
                </div>
              ))}
            </div>
          </CaseStudySection>

          {/* next project link */}
          {next && (
            <div className="cs-next-project">
              <Link
                href={`/projects/${next.slug}`}
                className="cs-next-project-link"
              >
                <span className="cs-next-label">next project</span>
                <span className="cs-next-name">{next.name}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M7 4L13 10L7 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── mobile horizontal pill bar ── */

const SECTIONS = [
  { id: "tldr", label: "tldr" },
  { id: "problem", label: "problem" },
  { id: "research", label: "research" },
  { id: "solution", label: "solution" },
  { id: "learnings", label: "learnings" },
];

function MobileSectionBar() {
  const [activeSection, setActiveSection] = useState("tldr");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          const topId = visible[0].target.getAttribute("data-section");
          if (topId) setActiveSection(topId);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="cs-mobile-pills">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          className={`cs-mobile-pill ${activeSection === id ? "cs-mobile-pill-active" : ""}`}
          onClick={() => scrollToSection(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
