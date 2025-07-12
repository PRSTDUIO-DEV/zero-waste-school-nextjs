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
  },
  // Skip build-time errors for missing environment variables
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Output standalone for better Vercel compatibility
  output: 'standalone',
  // Disable static generation for problematic pages
  staticPageGenerationTimeout: 1000
};

export default nextConfig;
