"use client";

interface CompanyLogoIconProps {
  src?: string;
  name: string;
  wide?: boolean;
  className?: string;
}

/** rounded square icon (favicon shape) for company logos; wide for horizontal wordmarks */
export default function CompanyLogoIcon({
  src,
  name,
  wide = false,
  className = "",
}: CompanyLogoIconProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`company-logo-icon ${wide ? "company-logo-icon-wide" : ""} ${className}`}
      aria-hidden
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span className="company-logo-icon-fallback">{initial}</span>
      )}
    </div>
  );
}
