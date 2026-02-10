"use client";
import React from "react";
import "./NavLink.css";

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

const navItems: NavItem[] = [
  { label: "home", href: "#", isActive: true },
  { label: "about", href: "#about" },
  { label: "more", href: "#more" },
  { label: "articles", href: "#articles" },
];

const NavDivider = () => <span className="nav-divider">/</span>;

const NavLink = ({ item }: { item: NavItem }) => (
  <a href={item.href} className={`nav-link ${item.isActive ? "active" : ""}`}>
    <span className="nav-link-inner">
      {item.label}
      <span className="nav-underline" />
    </span>
  </a>
);

interface NavbarProps {
  showLogo?: boolean;
  showNav?: boolean;
}

export default function Navbar({ showLogo = true, showNav = true }: NavbarProps) {
  return (
    <nav
      className="navbar"
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
        padding: "24px 40px",
        pointerEvents: "none",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* logo */}
      <a
        href="/"
        className={`navbar-logo ${showLogo ? "visible" : ""}`}
        style={{ pointerEvents: "auto" }}
      >
        <img src="/logo.svg" alt="codemathics" className="logo-svg" />
      </a>

      {/* nav links */}
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
            <NavLink item={item} />
            {index < navItems.length - 1 && <NavDivider />}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
