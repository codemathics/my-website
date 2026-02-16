"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./NavLink.css";

interface NavItem {
  label: string;
  href: string;
  isRoute?: boolean; // use Next.js Link and pathname for active
  isExternal?: boolean; // open in new tab
}

const navItems: NavItem[] = [
  { label: "home", href: "/", isRoute: true },
  { label: "about", href: "/about", isRoute: true },
  { label: "articles", href: "https://codemathics.substack.com/", isRoute: false, isExternal: true },
  { label: "books", href: "/books", isRoute: true },
];

const NavDivider = () => <span className="nav-divider">/</span>;

const NavLink = ({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const content = (
    <span className="nav-link-inner">
      {item.label}
      <span className="nav-underline" />
    </span>
  );
  if (item.isRoute) {
    return (
      <Link
        href={item.href}
        className={`nav-link ${isActive ? "active" : ""}`}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }
  return (
    <a
      href={item.href}
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={onClick}
      {...(item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
};

interface NavbarProps {
  showLogo?: boolean;
  showNav?: boolean;
}

const SCROLL_THRESHOLD = 60;

export default function Navbar({ showLogo = true, showNav = true }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // glassmorphism when user has scrolled (home uses .page-container, other pages use window)
  useEffect(() => {
    const getScrollTop = () => {
      const container = document.querySelector(".page-container");
      if (container) return (container as HTMLElement).scrollTop;
      return window.scrollY ?? window.pageYOffset;
    };
    const onScroll = () => setScrolled(getScrollTop() > SCROLL_THRESHOLD);
    onScroll(); // set initial state
    const container = document.querySelector(".page-container");
    if (container) {
      container.addEventListener("scroll", onScroll, { passive: true });
      return () => container.removeEventListener("scroll", onScroll);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menu on resize to desktop
  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 992) setMenuOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  // prevent body scroll when menu open on mobile
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Link
          href="/"
          className={`navbar-logo ${showLogo ? "visible" : ""}`}
          style={{ pointerEvents: "auto" }}
        >
          <Image
            src="/logo.svg"
            alt="codemathics"
            className="logo-svg"
            width={120}
            height={36}
            priority
          />
        </Link>

        {/* desktop nav links — hidden on tablet/mobile */}
        <div
          className={`navbar-links ${showNav ? "visible" : ""}`}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "4px",
            pointerEvents: "auto",
          }}
        >
          {navItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <NavLink
                item={item}
                isActive={
                  item.isRoute
                    ? pathname === item.href
                    : false
                }
              />
              {index < navItems.length - 1 && <NavDivider />}
            </React.Fragment>
          ))}
        </div>

        {/* hamburger — visible only on tablet/mobile */}
        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "close menu" : "open menu"}
          aria-expanded={menuOpen}
          style={{ pointerEvents: "auto" }}
        >
          <span className="navbar-toggle-line" />
          <span className="navbar-toggle-line" />
          <span className="navbar-toggle-line" />
        </button>
      </nav>

      {/* overlay + dropdown panel for tablet/mobile — animation matches city/chat modals */}
      <div
        className={`navbar-overlay ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        className={`navbar-dropdown ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      >
        <div className="navbar-dropdown-inner" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="navbar-dropdown-close"
            onClick={closeMenu}
            aria-label="close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              isActive={
                item.isRoute ? pathname === item.href : false
              }
              onClick={closeMenu}
            />
          ))}
        </div>
      </div>
    </>
  );
}
