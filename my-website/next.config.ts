import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here (leaving this here to remind me of any configurations i need to add) */
  async redirects() {
    return [
      {
        source: "/portfolio",
        destination: "https://glowing-bean-c67.notion.site/Clement-Hugbo-a776e38330ad40f684007bd25e97fa4e?source=copy_link",
        permanent: true, // 308 (use false for 307/temp)
      },
      {
        source: "/portfolio/:path*",
        destination: "https://glowing-bean-c67.notion.site/Clement-Hugbo-a776e38330ad40f684007bd25e97fa4e?source=copy_link/:path*",
        permanent: true,
      },
        /* apply to work with me reroutes to tally */
        {
          source: "/apply",
          destination: "https://tally.so/r/meblrO",
          permanent: true,
        },
    ];
  },
};

export default nextConfig;
