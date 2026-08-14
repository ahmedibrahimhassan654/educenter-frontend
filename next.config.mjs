/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  distDir: '.next',

  // Optimize images (unoptimized required for static export)
  images: {
    unoptimized: true,
  },

  // Optimize bundle
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'zustand',
      'axios',
      'react-hook-form',
      'zod',
      'sonner',
    ],
  },

  // Webpack optimizations (only used when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      };
    }

    // Better file watching in development (webpack only)
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;