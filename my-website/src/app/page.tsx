"use client";
import React, { useRef, useCallback, useEffect } from "react";
import Lottie from "lottie-react";
import quoteAnimation from "../../quote.json";
import sfAnimation from "../../public/sf.json";
import uaeAnimation from "../../public/uae.json";
import ProjectShowcase, { ShowcaseProject } from "@/components/ProjectShowcase";
import Navbar from "@/components/Navbar";
import CityModal from "@/components/CityModal";

// projects data — blockradar and verisync; BLOCKRADAR Lottie loaded lazily in ProjectShowcase
const projects: ShowcaseProject[] = [
  {
    name: "BLOCKRADAR",
    description:
      "blockradar is a stablecoin wallet infrastructure for fintechs, enabling secure custody,\nsettlement, and visibility across multi-chain payment flows.",
    link: "https://blockradar.co",
    highlights: [
      "$350M+ processed volume post beta",
      "0→1 product + brand + interaction",
      "creative direction and motion design",
    ],
  },
  {
    name: "VERISYNC",
    description:
      "verisync is an identity verification platform that streamlines kyc/aml compliance for fintechs and banks across emerging markets.",
    primaryImage: {
      src: "https://res.cloudinary.com/dhajah4xb/image/upload/v1770023759/verisync_k9thto.png",
      alt: "Verisync dashboard",
    },
    highlights: [
      "end-to-end design system",
      "50% faster onboarding flow",
      "brand identity + product design",
    ],
  },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLImageElement>(null);

  // spotlight: refs only so we never re-render from mouse/RAF
  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 960;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2.2 : 400;
  const mouseRef = useRef({ x: centerX, y: centerY });
  const smoothedTargetRef = useRef({ x: centerX, y: centerY });
  const currentRef = useRef({ x: centerX, y: centerY });
  const hasUserMovedRef = useRef(false);
  const isHeroPointerInsideRef = useRef(false);
  const entranceCompleteRef = useRef(false);
  const isMobileRef = useRef(false);

  // entrance animation flags
  const [hasEntered, setHasEntered] = React.useState(false);
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
    const t1 = setTimeout(() => setHasEntered(true), 120);
    const t2 = setTimeout(() => { entranceCompleteRef.current = true; }, base);
    const t3 = setTimeout(() => setShowLogo(true), base + 200);
    const t4 = setTimeout(() => setShowTopButton(true), base + 400);
    const t5 = setTimeout(() => setShowQuote(true), base + 600);
    const t6 = setTimeout(() => setShowText(true), base + 900);
    const t7 = setTimeout(() => setShowLine1(true), base + 1100);
    const t8 = setTimeout(() => setShowLine2(true), base + 1300);
    return () => {
      [t1, t2, t3, t4, t5, t6, t7, t8].forEach(clearTimeout);
    };
  }, []);

  // spotlight: single RAF updates refs and sets hero mask directly (no React state → no re-renders)
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
      const immediateX = hasMoved ? mouse.x : centerX;
      const immediateY = hasMoved ? mouse.y : centerY;

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
        const { x, y } = currentRef.current;
        const size = isMobileRef.current ? "28rem 20rem" : "36rem 26rem";
        const gradient = `radial-gradient(ellipse ${size} at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 26%, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.8) 58%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.3) 84%, rgba(0,0,0,0.12) 94%, rgba(0,0,0,0) 100%)`;
        el.style.maskImage = gradient;
        el.style.webkitMaskImage = gradient;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [centerX, centerY]);

  // hero styles based on scroll (mask is set by RAF in useEffect, not here)
  const heroImageStyle = {
    transform: isMobile ? "scale(1.1)" : `scale(${1 - heroScrollProgress * 0.08})`,
    transformOrigin: "center",
    opacity: 1 - heroScrollProgress * 0.7,
    transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
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
        {/* headshot with spotlight mask (mask position updated in RAF, not React) */}
        <img
          ref={heroRef}
          src="https://res.cloudinary.com/dhajah4xb/image/upload/v1758094446/headShot1_buzn8d.png"
          className={`absolute inset-0 h-full w-full ${isMobile ? "mobile-image" : "object-contain"} ${hasEntered ? "fade-up-enter-active" : "fade-up-enter"} hero-image`}
          alt="headshot"
          style={heroImageStyle}
          loading="eager"
          fetchPriority="high"
        />

        {/* content overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-end ${isMobile ? "p-4" : "p-8"} pointer-events-none hero-content`}
          style={heroContentStyle}
        >
          <div className="flex flex-col items-center space-y-8 pb-16">
            {/* quote animation */}
            <div className={`hero-quote transition-all duration-700 ${showQuote ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Lottie
                animationData={quoteAnimation}
                style={{ width: 600, height: 60 }}
                loop={false}
              />
            </div>

            {/* bio text */}
            <div className={`transition-all duration-700 delay-400 ${showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="text-center max-w-2xl leading-relaxed pointer-events-auto main-text">
                <div className={`transition-all duration-500 ${showLine1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                  Clement is a product designer and creative director based in{" "}

                  {/* san francisco — flag + modal trigger */}
                  <span
                    className="relative inline-block cursor-pointer group"
                    onMouseEnter={() => { setHoveredCity("san-francisco"); if (!sfFlagInteracted) setSfFlagInteracted(true); }}
                    onMouseLeave={() => setHoveredCity(null)}
                    onTouchStart={() => { setHoveredCity("san-francisco"); if (!sfFlagInteracted) setSfFlagInteracted(true); }}
                    onTouchEnd={() => setHoveredCity(null)}
                    onClick={() => setActiveCityModal("san-francisco")}
                  >
                    <span className="relative">san francisco</span>
                    {/* usa flag — closer to text on mobile only; desktop keeps original position */}
                    <div
                      className={`absolute -top-7 sm:-top-12 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-out ${
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
                          style={{ width: isMobile ? 60 : 80, height: isMobile ? 35 : 45 }}
                          loop={false}
                          autoplay={true}
                        />
                      </div>
                    </div>
                  </span>
                  {" "}
                  <span>
                    <img src="/direction.svg" alt="→" className="inline-block mx-.5 w-4 h-4" />
                  </span>
                  {" "}

                  {/* dubai — flag + modal trigger */}
                  <span
                    className="relative inline-block cursor-pointer group"
                    onMouseEnter={() => { setHoveredCity("dubai"); if (!sfFlagInteracted) setSfFlagInteracted(true); }}
                    onMouseLeave={() => setHoveredCity(null)}
                    onTouchStart={() => { setHoveredCity("dubai"); if (!sfFlagInteracted) setSfFlagInteracted(true); }}
                    onTouchEnd={() => setHoveredCity(null)}
                    onClick={() => setActiveCityModal("dubai")}
                  >
                    <span className="relative">dubai</span>
                    {/* uae flag */}
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
                        style={{ width: isMobile ? 60 : 80, height: isMobile ? 35 : 45 }}
                        loop={false}
                        autoplay={true}
                      />
                    </div>
                  </span>
                  .
                </div>
                <div className={`transition-all duration-500 delay-200 ${showLine2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                  passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.
                </div>
              </div>
            </div>

            {/* portfolio button */}
            <div className={`transition-all duration-700 delay-600 ${showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <button className="btn-primary pointer-events-auto">
                <a href="https://codemathics.design/portfolio">my portfolio</a>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* projects */}
      <ProjectShowcase projects={projects} />

      {/* city modal */}
      <CityModal
        city={activeCityModal}
        onClose={() => setActiveCityModal(null)}
      />
    </div>
  );
}
