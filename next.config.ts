import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gen.pollinations.ai",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;