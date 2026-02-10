"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
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
      <Link
        href="/"
        className={`navbar-logo ${showLogo ? "visible" : ""}`}
        style={{ pointerEvents: "auto" }}
      >
        <Image src="/logo.svg" alt="codemathics" className="logo-svg" width={120} height={36} priority />
      </Link>

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
