import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client"],
  // Prevent API routes from being pre-rendered at build time
  trailingSlash: false,
  // Disable static generation for problematic pages
  staticPageGenerationTimeout: 1000,
};

export default nextConfig;
