"use client";
import useMousePosition from "@/hooks/useMousePosition";
import React from "react";
import Lottie from "lottie-react";
import quoteAnimation from "../../quote.json";
import sfAnimation from "../../public/sf.json";
import uaeAnimation from "../../public/uae.json";
export default function Home() {const mousePosition = useMousePosition();

  // Center position for the face spotlight (fallback when mouse is not detected)
  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 960;
  const centerY =
    typeof window !== "undefined" ? window.innerHeight / 2.2 : 400; // Slightly higher than center for face position

  // Animate spotlight: start centered; follow mouse with subtle delay and smoothing
  const [current, setCurrent] = React.useState({ x: centerX, y: centerY });
  const hasUserMovedRef = React.useRef(false);
  const smoothedTargetRef = React.useRef({ x: centerX, y: centerY });
  const entranceCompleteRef = React.useRef(false);
  const [hasEntered, setHasEntered] = React.useState(false);
  const [showQuote, setShowQuote] = React.useState(false);
  const [showText, setShowText] = React.useState(false);
  const [showLine1, setShowLine1] = React.useState(false);
  const [showLine2, setShowLine2] = React.useState(false);
  const [hoveredCity, setHoveredCity] = React.useState<string | null>(null);
  const [showLogo, setShowLogo] = React.useState(false);
  const [showTopButton, setShowTopButton] = React.useState(false);

  // Run a soft fade-up entrance before enabling mouse-follow
  React.useEffect(() => {
    const entranceDurationMs = 1200;
    const t1 = setTimeout(() => setHasEntered(true), 120);
    const t2 = setTimeout(() => {
      entranceCompleteRef.current = true;
    }, entranceDurationMs);
    const t3 = setTimeout(() => setShowLogo(true), entranceDurationMs + 200);
    const t4 = setTimeout(() => setShowTopButton(true), entranceDurationMs + 400);
    const t5 = setTimeout(() => setShowQuote(true), entranceDurationMs + 600);
    const t6 = setTimeout(() => setShowText(true), entranceDurationMs + 900);
    const t7 = setTimeout(() => setShowLine1(true), entranceDurationMs + 1100);
    const t8 = setTimeout(() => setShowLine2(true), entranceDurationMs + 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
  }, []);

  React.useEffect(() => {
    if (!entranceCompleteRef.current) return;
    if (mousePosition.x !== null || mousePosition.y !== null) {
      hasUserMovedRef.current = true;
    }
  }, [mousePosition.x, mousePosition.y]);

  React.useEffect(() => {
    let rafId: number;
    const targetLag = 0.06; // smaller = more delay before target catches up
    const followEase = 0.08; // spotlight softness following the lagged target

    const animate = () => {
      const immediateX = entranceCompleteRef.current && hasUserMovedRef.current && mousePosition.x !== null ? mousePosition.x : centerX;
      const immediateY = entranceCompleteRef.current && hasUserMovedRef.current && mousePosition.y !== null ? mousePosition.y : centerY;

      // First stage: ease the target toward the immediate mouse to create subtle delay
      const prevTarget = smoothedTargetRef.current;
      const nextTargetX = prevTarget.x + (immediateX - prevTarget.x) * targetLag;
      const nextTargetY = prevTarget.y + (immediateY - prevTarget.y) * targetLag;
      smoothedTargetRef.current = { x: nextTargetX, y: nextTargetY };

      // Second stage: spotlight follows the smoothed target
      setCurrent(prev => {
        const nextX = prev.x + (smoothedTargetRef.current.x - prev.x) * followEase;
        const nextY = prev.y + (smoothedTargetRef.current.y - prev.y) * followEase;
        return { x: nextX, y: nextY };
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [centerX, centerY, mousePosition.x, mousePosition.y]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">

      {/* Color image with single moving spotlight */}
      <img
        src="https://res.cloudinary.com/dhajah4xb/image/upload/v1758094446/headShot1_buzn8d.png"
        className={`absolute inset-0 h-full w-full object-contain ${hasEntered ? "fade-up-enter-active" : "fade-up-enter"}`}
        alt="Image"
        style={{
          transform: "scale(0.9)",
          transformOrigin: "center",
          maskImage: `radial-gradient(ellipse 36rem 26rem at ${current.x}px ${current.y}px,
            rgba(0,0,0,1) 0%,
            rgba(0,0,0,1) 26%,
            rgba(0,0,0,0.95) 40%,
            rgba(0,0,0,0.8) 58%,
            rgba(0,0,0,0.55) 72%,
            rgba(0,0,0,0.3) 84%,
            rgba(0,0,0,0.12) 94%,
            rgba(0,0,0,0) 100%)`,
          WebkitMaskImage: `radial-gradient(ellipse 36rem 26rem at ${current.x}px ${current.y}px,
            rgba(0,0,0,1) 0%,
            rgba(0,0,0,1) 26%,
            rgba(0,0,0,0.95) 40%,
            rgba(0,0,0,0.8) 58%,
            rgba(0,0,0,0.55) 72%,
            rgba(0,0,0,0.3) 84%,
            rgba(0,0,0,0.12) 94%,
            rgba(0,0,0,0) 100%)`,
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
        {/* Top navigation */}
        <div className="flex justify-between items-start">
          {/* Logo */}
          <div className={`flex items-center transition-all duration-700 ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <img 
              src="/logo.svg" 
              alt="Logo" 
              className="w-24 h-16"
            />
          </div>
          
          {/* About me button */}
          <button className={`btn-primary pointer-events-auto transition-all duration-700 ${showTopButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            🚧 website: <strong>still a wip</strong>
          </button>
        </div>

        {/* Bottom content */}
        <div className="flex flex-col items-center space-y-8 pb-16">
          {/* Quote animation */}
          <div className={`transition-all duration-700 ${showQuote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Lottie 
              animationData={quoteAnimation} 
              style={{ width: 600, height: 60 }}
              loop={false}
            />
          </div>

          {/* Main description */}
          <div className={`transition-all duration-700 delay-400 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center max-w-2xl leading-relaxed pointer-events-auto main-text">
              <div className={`transition-all duration-500 ${showLine1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                Clement is a product designer and creative director based in{' '}
                <span 
                  className="relative inline-block cursor-pointer group"
                  onMouseEnter={() => setHoveredCity('san-francisco')}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  <span className="relative">
                    san francisco
                  </span>
                  {/* USA Flag */}
                  <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-out ${
                    hoveredCity === 'san-francisco' 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-75 translate-y-2'
                  }`}>
                    <Lottie 
                      key={hoveredCity === 'san-francisco' ? 'sf-active' : 'sf-inactive'}
                      animationData={sfAnimation} 
                      style={{ width: 80, height: 45 }}
                      loop={false}
                      autoplay={true}
                    />
                  </div>
                </span>
                {' '}
                <span><img src="/direction.svg" alt="→" className="inline-block mx-.5 w-4 h-4" /></span>
                {' '}
                <span 
                  className="relative inline-block cursor-pointer group"
                  onMouseEnter={() => setHoveredCity('dubai')}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  <span className="relative">
                    dubai
                  </span>
                  {/* UAE Flag */}
                  <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-out ${
                    hoveredCity === 'dubai' 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-75 translate-y-2'
                  }`}>
                    <Lottie 
                      key={hoveredCity === 'dubai' ? 'uae-active' : 'uae-inactive'}
                      animationData={uaeAnimation} 
                      style={{ width: 80, height: 45 }}
                      loop={false}
                      autoplay={true}
                    />
                  </div>
                </span>
                .
              </div>
              <div className={`transition-all duration-500 delay-200 ${showLine2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.
              </div>
            </div>
          </div>

          {/* Bottom about me button */}
          <div className={`transition-all duration-700 delay-600 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button className="btn-primary pointer-events-auto">
              about me
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
