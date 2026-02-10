import type { Metadata } from "next";
import { Geist, Geist_Mono, Gochi_Hand } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gochiHand = Gochi_Hand({
  variable: "--font-gochi-hand",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "clement hugbo — product designer & creative director",
  description: "personal website of clement hugbo, product designer and creative director based in san francisco and dubai.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "clement hugbo — product designer & creative director",
    description: "personal website of clement hugbo, product designer and creative director based in san francisco and dubai.",
    images: [
      {
        url: "/og.png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "clement hugbo — product designer & creative director",
    description: "personal website of clement hugbo, product designer and creative director based in san francisco and dubai.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gochiHand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
