import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pin the workspace root — a stray lockfile in a parent dir otherwise makes
  // turbopack infer the wrong root and fail to resolve tailwindcss.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  webpack(config, { dev }) {
    if (dev) {
      // ignore legacy node_modules during file-watching
      const ignorePatterns = ["**/node_modules_old/**"];
      const existing = config.watchOptions?.ignored;

      const merged: string[] = [
        ...ignorePatterns,
        ...(typeof existing === "string" && existing.trim().length > 0
          ? [existing]
          : Array.isArray(existing)
            ? (existing.filter(
                (v): v is string => typeof v === "string" && v.trim().length > 0
              ) as string[])
            : []),
      ];

      config.watchOptions = { ...(config.watchOptions ?? {}), ignored: merged };
    }
    return config;
  },

  async rewrites() {
    // morphyn is a hosted vite spa (landing, studio, render) under
    // public/experiments/morphyn. the experiments card links to /studio.
    // these paths are not an [slug] detail page, so they have to win
    // before the app router 404s them.
    const morphyn = "/experiments/morphyn/index.html";
    return {
      beforeFiles: [
        { source: "/experiments/morphyn", destination: morphyn },
        { source: "/experiments/morphyn/", destination: morphyn },
        { source: "/experiments/morphyn/studio", destination: morphyn },
        { source: "/experiments/morphyn/studio/", destination: morphyn },
        { source: "/experiments/morphyn/render", destination: morphyn },
        { source: "/experiments/morphyn/render/", destination: morphyn },
      ],
    };
  },

  async redirects() {
    return [
      {
        source: "/portfolio",
        destination:
          "https://glowing-bean-c67.notion.site/Clement-Hugbo-a776e38330ad40f684007bd25e97fa4e?source=copy_link",
        permanent: true,
      },
      {
        source: "/portfolio/:path*",
        destination:
          "https://glowing-bean-c67.notion.site/Clement-Hugbo-a776e38330ad40f684007bd25e97fa4e?source=copy_link/:path*",
        permanent: true,
      },
      // roles application redirect
      {
        source: "/apply",
        destination: "https://tally.so/r/meblrO",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
