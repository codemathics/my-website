"use client";
import React, { useRef, useCallback, useEffect } from "react";
import Lottie from "lottie-react";
import sfAnimation from "../../public/sf.json";
import uaeAnimation from "../../public/uae.json";
import ProjectShowcase from "@/components/ProjectShowcase";
import Navbar from "@/components/Navbar";
import CityModal from "@/components/CityModal";
import { getShowcaseProjects } from "@/data/projects";

const projects = getShowcaseProjects();

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLImageElement>(null);

  // spotlight: refs only so we never re-render from mouse/raf
  const mouseRef = useRef({ x: 960, y: 400 });
  const smoothedTargetRef = useRef({ x: 960, y: 400 });
  const currentRef = useRef({ x: 960, y: 400 });
  const hasUserMovedRef = useRef(false);
  const isHeroPointerInsideRef = useRef(false);
  const entranceCompleteRef = useRef(false);
  const isMobileRef = useRef(false);

  // entrance animation flags
  const [showLogo, setShowLogo] = React.useState(false);
  const [showTopButton, setShowTopButton] = React.useState(false);
  const [showQuote, setShowQuote] = React.useState(false);
  const [showText, setShowText] = React.useState(false);
  const [showLine1, setShowLine1] = React.useState(false);
  const [showLine2, setShowLine2] = React.useState(false);

  // interactive elements
  const [hoveredCity, setHoveredCity] = React.useState<string | null>(null);
  const [activeCityModal, setActiveCityModal] = React.useState<
    "san-francisco" | "dubai" | null
  >(null);
  const [sfFlagInteracted, setSfFlagInteracted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // shimmer state — shimmer plays once on load, stops after first city tap
  const [sfShimmerActive, setSfShimmerActive] = React.useState(true);

  // scroll-based hero fade
  const [heroScrollProgress, setHeroScrollProgress] = React.useState(0);

  // mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // scroll progress for hero parallax
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const windowHeight = window.innerHeight;
    const progress = Math.min(1, scrollTop / (windowHeight * 0.6));
    setHeroScrollProgress(progress);
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // entrance animation sequence
  React.useEffect(() => {
    const base = 1200;
    const t1 = setTimeout(() => { entranceCompleteRef.current = true; }, base);
    const t2 = setTimeout(() => setShowLogo(true), base + 200);
    const t3 = setTimeout(() => setShowTopButton(true), base + 400);
    const t4 = setTimeout(() => setShowQuote(true), base + 600);
    const t5 = setTimeout(() => setShowText(true), base + 900);
    const t6 = setTimeout(() => setShowLine1(true), base + 1100);
    const t7 = setTimeout(() => setShowLine2(true), base + 1300);
    return () => {
      [t1, t2, t3, t4, t5, t6, t7].forEach(clearTimeout);
    };
  }, []);

  // spotlight: single raf updates refs and sets hero mask directly (no react state → no re-renders)
  useEffect(() => {
    const targetLag = 0.06;
    const followEase = 0.08;
    let rafId: number;

    const animate = () => {
      const hasMoved =
        entranceCompleteRef.current &&
        hasUserMovedRef.current &&
        isHeroPointerInsideRef.current;
      const mouse = mouseRef.current;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2.2;
      const immediateX = hasMoved ? mouse.x : cx;
      const immediateY = hasMoved ? mouse.y : cy;

      const prevSmoothed = smoothedTargetRef.current;
      smoothedTargetRef.current = {
        x: prevSmoothed.x + (immediateX - prevSmoothed.x) * targetLag,
        y: prevSmoothed.y + (immediateY - prevSmoothed.y) * targetLag,
      };

      const prevCurrent = currentRef.current;
      const smoothed = smoothedTargetRef.current;
      currentRef.current = {
        x: prevCurrent.x + (smoothed.x - prevCurrent.x) * followEase,
        y: prevCurrent.y + (smoothed.y - prevCurrent.y) * followEase,
      };

      const el = heroRef.current;
      if (el) {
        if (isMobileRef.current) {
          el.style.maskImage = "none";
          el.style.webkitMaskImage = "none";
        } else {
          const { x, y } = currentRef.current;
          const size = "36rem 26rem";
          const gradient = `radial-gradient(ellipse ${size} at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 26%, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.8) 58%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.3) 84%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)`;
          el.style.maskImage = gradient;
          el.style.webkitMaskImage = gradient;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // hero styles based on scroll (mask is set by raf in useeffect, not here)
  const heroImageStyle = {
    transform: isMobile ? undefined : `scale(${1 - heroScrollProgress * 0.08})`,
    transformOrigin: "center",
    opacity: isMobile ? undefined : 1 - heroScrollProgress * 0.7,
    transition: isMobile ? undefined : "transform 0.3s ease-out, opacity 0.3s ease-out",
  };

  const heroContentStyle = {
    opacity: 1 - heroScrollProgress * 1.2,
    transform: `translateY(${-heroScrollProgress * 60}px)`,
    transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
  };

  return (
    <div ref={containerRef} className="page-container">
      <Navbar showLogo={showLogo} showNav={showTopButton} />

      {/* hero */}
      <div
        className={`relative w-screen overflow-hidden bg-black hero-section ${isMobile ? "mobile-container" : ""}`}
        style={{ margin: 0, padding: 0, border: "none", outline: "none" }}
        onPointerEnter={(e) => {
          isHeroPointerInsideRef.current = true;
          mouseRef.current = { x: e.clientX, y: e.clientY };
          hasUserMovedRef.current = true;
        }}
        onPointerMove={(e) => {
          if (!isHeroPointerInsideRef.current) return;
          mouseRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerLeave={() => {
          isHeroPointerInsideRef.current = false;
        }}
      >
        {/* headshot with spotlight mask (mask position updated in raf, not react) */}
        <div className="hero-image-wrap">
          <img
            ref={heroRef}
            src={isMobile ? "/mobile-headshot.png" : "https://res.cloudinary.com/dhajah4xb/image/upload/v1758094446/headShot1_buzn8d.png"}
            className={`absolute inset-0 h-full w-full ${isMobile ? "mobile-image" : "object-contain"} hero-image`}
            alt="headshot"
            style={heroImageStyle}
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {/* content overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-end ${isMobile ? "p-4" : "p-8"} pointer-events-none hero-content`}
          style={heroContentStyle}
        >
          <div className="hero-content-inner flex flex-col items-center space-y-8 pb-16">
            {/* quote */}
            <div className="hero-quote">
              <div className="hero-quote-content">
                <p className="hero-quote-text" aria-label={"\u201CClement has a great eye for detail, and he is a joy to work with\u201D"}>
                  {(() => {
                    const lines = ["\u201CClement has a great eye for detail,", "and he is a joy to work with\u201D"];
                    let offset = 0;
                    return lines.map((line, li) => {
                      const lineOffset = offset;
                      offset += line.length;
                      return (
                        <span key={li} className="hero-quote-line">
                          {line.split("").map((ch, i) => (
                            <span
                              key={lineOffset + i}
                              className={`hero-quote-letter ${showQuote ? "hero-quote-letter-visible" : ""}`}
                              style={{ transitionDelay: showQuote ? `${(lineOffset + i) * 0.03}s` : "0s" }}
                              aria-hidden="true"
                            >
                              {ch === " " ? "\u00A0" : ch}
                            </span>
                          ))}
                        </span>
                      );
                    });
                  })()}
                </p>
                <div className={`hero-quote-attribution ${showQuote ? "hero-quote-attribution-visible" : ""}`}>
                  <img
                    src="/fons-mans.png"
                    alt="Fons Mans"
                    className="hero-quote-avatar"
                  />
                  <span className="hero-quote-author">Fons Mans, Creative Director, Offgrid</span>
                </div>
              </div>
            </div>

            {/* bio text */}
            <div className={`transition-all duration-700 delay-400 ${showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-center max-w-2xl leading-relaxed pointer-events-auto main-text">
                <div className={`transition-all duration-500 ${showLine1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                  Clement is a product designer and creative director based in{" "}

                  {/* san francisco — shimmer on mobile, flag on desktop */}
                  <span
                    className="relative inline-block cursor-pointer group"
                    onMouseEnter={() => { if (!isMobile) { setHoveredCity("san-francisco"); if (!sfFlagInteracted) setSfFlagInteracted(true); } }}
                    onMouseLeave={() => { if (!isMobile) setHoveredCity(null); }}
                    onTouchStart={() => { setHoveredCity("san-francisco"); if (!sfFlagInteracted) setSfFlagInteracted(true); setSfShimmerActive(false); }}
                    onTouchEnd={() => setHoveredCity(null)}
                    onClick={() => { if (isMobile) setSfShimmerActive(false); setActiveCityModal("san-francisco"); }}
                  >
                    <span className={`relative ${isMobile && sfShimmerActive ? "shimmer-city" : isMobile ? "shimmer-city-off" : ""}`}>san francisco</span>
                    {/* usa flag — desktop only */}
                    {!isMobile && (
                      <div
                        className={`absolute -top-12 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-out ${
                          !sfFlagInteracted && hoveredCity !== "dubai"
                            ? "opacity-100 scale-100 translate-y-0"
                            : hoveredCity === "san-francisco"
                              ? "opacity-100 scale-100 translate-y-0"
                              : "opacity-0 scale-75 translate-y-2"
                        }`}
                      >
                        <div className={!sfFlagInteracted && hoveredCity !== "dubai" ? "flag-bounce" : ""}>
                          <Lottie
                            key={hoveredCity === "san-francisco" ? "sf-active" : "sf-inactive"}
                            animationData={sfAnimation}
                            style={{ width: 80, height: 45 }}
                            loop={false}
                            autoplay={true}
                          />
                        </div>
                      </div>
                    )}
                  </span>
                  {" "}
                  <span>
                    <img src="/direction.svg" alt="→" className="inline-block mx-.5 w-4 h-4" />
                  </span>
                  {" "}

                  {/* dubai — flag on desktop, tap-to-open on mobile */}
                  <span
                    className="relative inline-block cursor-pointer group"
                    onMouseEnter={() => { if (!isMobile) { setHoveredCity("dubai"); if (!sfFlagInteracted) setSfFlagInteracted(true); } }}
                    onMouseLeave={() => { if (!isMobile) setHoveredCity(null); }}
                    onTouchStart={() => { setHoveredCity("dubai"); if (!sfFlagInteracted) setSfFlagInteracted(true); }}
                    onTouchEnd={() => setHoveredCity(null)}
                    onClick={() => setActiveCityModal("dubai")}
                  >
                    <span className="relative">dubai</span>
                    {/* uae flag — desktop only */}
                    {!isMobile && (
                      <div
                        className={`absolute -top-12 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-out ${
                          hoveredCity === "dubai"
                            ? "opacity-100 scale-100 translate-y-0"
                            : "opacity-0 scale-75 translate-y-2"
                        }`}
                      >
                        <Lottie
                          key={hoveredCity === "dubai" ? "uae-active" : "uae-inactive"}
                          animationData={uaeAnimation}
                          style={{ width: 80, height: 45 }}
                          loop={false}
                          autoplay={true}
                        />
                      </div>
                    )}
                  </span>
                  .
                </div>
                <div className={`transition-all duration-500 delay-200 ${showLine2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                  passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.
                </div>
              </div>
            </div>

            {/* scroll indicator */}
            <div
              className={`hero-scroll-indicator pointer-events-auto transition-all duration-700 delay-600 ${showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              onClick={() => document.getElementById("project-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="hero-scroll-text">view projects</span>
              <div className="hero-scroll-arrows">
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" className="hero-scroll-arrow hero-scroll-arrow-1">
                  <path d="M1 1L8 7L15 1" stroke="rgba(255,255,255,0.8)" strokeWidth="0.78" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" className="hero-scroll-arrow hero-scroll-arrow-2">
                  <path d="M1 1L8 7L15 1" stroke="rgba(255,255,255,0.6)" strokeWidth="0.78" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" className="hero-scroll-arrow hero-scroll-arrow-3">
                  <path d="M1 1L8 7L15 1" stroke="rgba(255,255,255,0.4)" strokeWidth="0.78" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* projects */}
      <section id="project-section" aria-label="projects">
        <ProjectShowcase projects={projects} />
      </section>

      {/* city modal */}
      <CityModal
        city={activeCityModal}
        onClose={() => setActiveCityModal(null)}
      />
    </div>
  );
}
