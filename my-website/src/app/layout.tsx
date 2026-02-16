import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Gochi_Hand } from "next/font/google";
import ChatAgent from "@/components/ChatAgent";
import "./globals.css";

const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

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
  description: "Clement is a product designer and creative director based in san francisco and dubai. passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "clement hugbo — product designer & creative director",
    description: "Clement is a product designer and creative director based in san francisco and dubai. passionate about creating visual stories and experiences that inspire and deliver measurable impact for businesses.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gochiHand.variable} antialiased`}
      >
        {children}
        <ChatAgent />
        {clarityProjectId && (
          <Script
            id="clarity-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityProjectId}");
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
