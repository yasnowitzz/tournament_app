import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {     turbo: {
    resolveExtensions: [
      '.mdx',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
  }, }, // 🔥 Wyłącza Turbopack
  output: 'standalone', // ✅ Minimalizuje ładowanie serwera
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Wszystkie zapytania na /api/
        destination: "http://localhost:3000/api/:path*", // Przekierowanie do backendu NestJS
      },
    ];
  },
};

export default nextConfig;