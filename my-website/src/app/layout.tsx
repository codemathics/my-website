import type { Metadata } from "next";
import ChatAgent from "@/components/ChatAgent";
import VideoReel from "@/components/VideoReel";
import ClarityScript from "@/components/ClarityScript";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "clement hugbo - product designer & creative director",
  description: "Clement is a product designer and creative director based in san francisco and dubai. passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: "/icon.png",
  },
  openGraph: {
    title: "clement hugbo - product designer & creative director",
    description: "Clement is a product designer and creative director based in san francisco and dubai. passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "clement hugbo - product designer & creative director",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "clement hugbo - product designer & creative director",
    description: "Clement is a product designer and creative director based in san francisco and dubai. passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gochi+Hand&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
      >
        {children}
        <VideoReel />
        <ChatAgent />
        <ClarityScript />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
