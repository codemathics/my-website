import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      // ignore legacy node_modules folder during file-watching
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
