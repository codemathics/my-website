"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="about-page">
      <Navbar showLogo={true} showNav={true} />
      <main className="about-main">
        <header className="about-hero">
          <h1 className="about-title">clement hugbo</h1>
          <p className="about-tagline">product, design, & everything in between.</p>
          <p className="about-location">san francisco / dubai</p>
        </header>

        <section className="about-intro">
          <div className="about-photo-wrap">
            <Image
              src="/about-me.png"
              alt="clement"
              width={400}
              height={400}
              className="about-photo"
              sizes="(max-width: 768px) 100vw, 360px"
            />
          </div>
          <div className="about-intro-text">
            <h2 className="about-block-title">hi, i&apos;m clement</h2>
            <div className="about-prose">
                  <p>
                    i&apos;m a senior product designer and multi-disciplinary creative. i ship products in ai, stablecoins, web3, fintech, saas, and anything that makes people&apos;s lives easier.
                    i care about ux, brand, and the little motion details that make things feel alive.
                    over the years i&apos;ve served as a principal product designer, staff designer, design manager, founder, and head of design across multiple ventures. with a foundation in software engineering, i bring end-to-end understanding of the product lifecycle and thrive in cross-functional teams, working closely with founders, engineers, product managers, and stakeholders to ship meaningful solutions.
                  </p>
                  <p>
                    i used to feel uncomfortable building in public 🤤, i have built and still building side projects, small tools, and experiments
                    across stablecoin, infrastructure, ai-assisted workflows and automations, plugins and storytelling through films, camera and lenses.
                  </p>
                  <p>
                    i enjoy collaborating with ai, it's now one of my super powers. helps me focus on the big picture and get things done faster. it broadens my sharp thinking skills and provides tighter execution. when
                    it&apos;s wrong /which happens occasionally 😎/, i go hands-on with the code and iterate until it&apos;s right.
                  </p>
                  <p>
                    outside work, i make cinematic short-form films, documentaries, and music videos. i also enjoy entrepreneurship, hold a masters degree in innovation and entrepreneurship, and
                    i chase good books, good conversations, and better taste in design, food and music.
                  </p>
                  <p>
                    come explore with me.
                  </p>
                  <p>
                    cheers! 🥂
                  </p>
            </div>
      </div>
        </section>

        <section className="about-block about-also">
          <h2 className="about-block-title">beyond product & design</h2>
          <p className="about-block-lead">
            i make films, mess with music, and create stuff that doesn&apos;t live in a
            figma file. here&apos;s where that lives.
          </p>
          <div className="about-also-links">
            <a
              href="https://youtube.com/@codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-also-card"
            >
              <span className="about-also-card-icon about-also-card-icon-youtube" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
                </svg>
              </span>
              <span className="about-also-card-label">youtube</span>
              <span className="about-also-card-desc">films, reels, and longer stuff</span>
              <span className="about-also-card-arrow">→</span>
            </a>
            <a
              href="https://instagram.com/codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-also-card"
            >
              <span className="about-also-card-icon about-also-card-icon-instagram" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/>
                </svg>
              </span>
              <span className="about-also-card-label">instagram</span>
              <span className="about-also-card-desc">visuals, bts, and day-to-day</span>
              <span className="about-also-card-arrow">→</span>
            </a>
          </div>
        </section>

        <section className="about-block">
          <h2 className="about-block-title">on my shelf</h2>
          <p className="about-block-lead">
            what i&apos;ve been reading about design, product, ai, filmmaking, creativity and everything in between.
          </p>
          <div className="about-shelf">
            <Link href="/books" className="about-shelf-book">
              <Image
                src="/books/book1.png"
                alt=""
                width={120}
                height={168}
                className="about-shelf-img"
              />
            </Link>
            <Link href="/books" className="about-shelf-book">
              <Image
                src="/books/book2.png"
                alt=""
                width={120}
                height={168}
                className="about-shelf-img"
              />
            </Link>
            <Link href="/books" className="about-shelf-book">
              <Image
                src="/books/book4.png"
                alt=""
                width={120}
                height={168}
                className="about-shelf-img"
              />
            </Link>
          </div>
          <Link href="/books" className="about-inline-link">see all my books →</Link>
        </section>

        <section className="about-block about-cta-block">
          <p className="about-cta-text">
            working on something cool? let&apos;s collaborate together.
          </p>
          <div className="about-cta-links">
            <a
              href="https://linkedin.com/in/codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-cta-link"
            >
              linkedin
            </a>
            <a
              href="https://x.com/codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-cta-link"
            >
              x
            </a>
            <a
              href="https://github.com/codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-cta-link"
            >
              github
            </a>
            <a
              href="https://instagram.com/codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-cta-link"
            >
              instagram
            </a>
            <a
              href="https://youtube.com/@codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-cta-link"
            >
              youtube
            </a>
            <a
              href="https://tiktok.com/@codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-cta-link"
            >
              tiktok
            </a>
            <a
              href="https://threads.net/@codemathics"
              target="_blank"
              rel="noopener noreferrer"
              className="about-cta-link"
            >
              threads
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
