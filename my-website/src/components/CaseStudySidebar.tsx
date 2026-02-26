"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CompanyLogoIcon from "@/components/CompanyLogoIcon";

const SECTIONS = [
  { id: "tldr", label: "tldr" },
  { id: "problem", label: "problem" },
  { id: "research", label: "research" },
  { id: "solution", label: "solution" },
  { id: "learnings", label: "learnings" },
];

interface CaseStudySidebarProps {
  projectName: string;
  logoIcon?: string;
  logoWide?: boolean;
  nextProjectSlug?: string;
  nextProjectName?: string;
}

export default function CaseStudySidebar({
  projectName,
  logoIcon,
  logoWide,
  nextProjectSlug,
  nextProjectName,
}: CaseStudySidebarProps) {
  const [activeSection, setActiveSection] = useState("tldr");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => {
            const aRect = a.boundingClientRect;
            const bRect = b.boundingClientRect;
            return aRect.top - bRect.top;
          });
          const topId = visible[0].target.getAttribute("data-section");
          if (topId) setActiveSection(topId);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="cs-sidebar">
      <Link href="/" className="cs-sidebar-back">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>back</span>
      </Link>

      <div className="cs-sidebar-brand">
        <CompanyLogoIcon
          src={logoIcon}
          name={projectName}
          wide={logoWide}
          className="cs-sidebar-logo"
        />
        <h1 className="cs-sidebar-title">{projectName}</h1>
      </div>

      <nav className="cs-sidebar-nav">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            className={`cs-sidebar-pill ${activeSection === id ? "cs-sidebar-pill-active" : ""}`}
            onClick={() => scrollToSection(id)}
          >
            <span className="nav-link-inner">
              {label}
              <span className="nav-underline" />
            </span>
          </button>
        ))}
      </nav>

      {nextProjectSlug && (
        <Link
          href={`/projects/${nextProjectSlug}`}
          className="cs-sidebar-next"
        >
          <span>{nextProjectName}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      )}
    </aside>
  );
}
