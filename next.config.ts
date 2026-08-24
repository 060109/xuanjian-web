import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["@prisma/client", "prisma", "@prisma/adapter-d1"],
  // Cloudflare Workers/Pages 环境无 Node fs 持久化需求，保持默认即可
};

export default nextConfig;
