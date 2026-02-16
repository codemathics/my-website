import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "about — clement hugbo",
  description:
    "Product designer and creative director based in San Francisco and Dubai. Focus on product design, design systems, brand identity, and measurable impact.",
};

export default function AboutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
