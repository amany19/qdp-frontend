import type { NextConfig } from "next";

// Production: set NEXT_PUBLIC_IMAGE_DOMAIN to your API host (e.g. api.yourdomain.com) so next/image can load uploads
const imageDomain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN;

const nextConfig: NextConfig = {
  /* config options here */
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
      ...(imageDomain
        ? [{ protocol: 'https' as const, hostname: imageDomain, pathname: '/uploads/**' }]
        : []),
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
