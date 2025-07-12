import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Prevent API routes from being pre-rendered at build time
  trailingSlash: false,
  // Disable static optimization for API routes
  generateBuildId: async () => {
    return 'zero-waste-school-' + Date.now()
  }
};

export default nextConfig;
