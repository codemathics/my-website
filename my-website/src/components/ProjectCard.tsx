"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import Lottie from "lottie-react";

interface ProjectImage {
  src: string;
  alt: string;
}

interface ProjectCardProps {
  name: string;
  description: string;
  primaryImage?: ProjectImage;
  primaryLottie?: object;
  secondaryImage?: ProjectImage;
  link?: string;
  highlights?: string[];
}

export default function ProjectCard({
  name,
  description,
  primaryImage,
  primaryLottie,
  secondaryImage,
  link,
  highlights = [],
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // visibility observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // scroll progress for secondary image reveal
  const handleScroll = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const cardMidpoint = rect.top + rect.height / 2;
    const progress = Math.max(
      0,
      Math.min(1, (windowHeight / 2 - cardMidpoint) / (rect.height / 2))
    );
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const container = document.querySelector(".page-container");
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <section
      ref={cardRef}
      className={`project-card ${isVisible ? "visible" : ""}`}
      style={{ background: "#010101" }}
    >
      <div className="project-gray-panel" />

      {/* project content */}
      <div className="project-content">
        {/* description */}
        <div className="project-info">
          <p className="project-description">{description}</p>
          {highlights.length > 0 && (
            <div className="project-highlights">
              {highlights.map((item) => (
                <div key={item} className="project-highlight">
                  <span className="project-highlight-icon" />
                  <span className="project-highlight-text">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* mockups */}
        <div className="project-mockups-container">
          <div className="mockup-stack">
            {/* primary — lottie or image */}
            {primaryLottie ? (
              <div className="mockup-primary mockup-lottie">
                <Lottie animationData={primaryLottie} loop={true} autoplay={true} />
              </div>
            ) : primaryImage ? (
              <img
                src={primaryImage.src}
                alt={primaryImage.alt}
                className="mockup-primary"
              />
            ) : null}

            {/* secondary — blurred, reveals on scroll */}
            {secondaryImage && (
              <img
                src={secondaryImage.src}
                alt={secondaryImage.alt}
                className={`mockup-secondary ${scrollProgress > 0.6 ? "in-focus" : ""}`}
                style={{
                  opacity: isVisible ? 0.3 + scrollProgress * 0.7 : 0,
                  filter: `blur(${Math.max(0, 6 - scrollProgress * 8)}px)`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* project name */}
      <h2 className="project-title">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            {name.split("").map((letter, index) => (
              <span
                key={index}
                className="title-letter"
                style={{ animationDelay: `${0.4 + index * 0.03}s` }}
              >
                {letter}
              </span>
            ))}
          </a>
        ) : (
          name.split("").map((letter, index) => (
            <span
              key={index}
              className="title-letter"
              style={{ animationDelay: `${0.4 + index * 0.03}s` }}
            >
              {letter}
            </span>
          ))
        )}
      </h2>
    </section>
  );
}
