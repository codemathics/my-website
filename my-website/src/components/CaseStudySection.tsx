"use client";
import React, { useRef, useState, useEffect } from "react";

interface CaseStudySectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export default function CaseStudySection({
  id,
  children,
  className = "",
}: CaseStudySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={`section-${id}`}
      data-section={id}
      className={`cs-section ${visible ? "cs-section-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
