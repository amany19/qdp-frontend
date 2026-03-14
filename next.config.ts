import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: process.cwd(), // Set turbopack root to client directory
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
        port: '3001',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Ignore ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build for deployment
    ignoreBuildErrors: true,
  },
devIndicators: false,
};

export default nextConfig;
