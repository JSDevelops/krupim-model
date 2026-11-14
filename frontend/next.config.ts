import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@google/generative-ai', '@anthropic-ai/sdk', 'openai', 'nodemailer', 'pg'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
        ],
      },
      {
        // Aggressive 1-year immutable caching for static 3D models (GLB, USDZ) & uploaded assets
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        // 1-day fresh cache with 7-day stale-while-revalidate for UI graphics and badges
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      // GitHub raw content (3D sample models)
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      // Google user avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // ModelViewer sample assets
      { protocol: 'https', hostname: 'modelviewer.dev' },
      // Apple AR Quick Look models
      { protocol: 'https', hostname: 'developer.apple.com' },
      // Railway storage (uploaded GLB/USDZ files)
      { protocol: 'https', hostname: '*.railway.app' },
      // Supabase storage
      { protocol: 'https', hostname: '*.supabase.co' },
      // Cloudflare R2 / Workers
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.workers.dev' },
    ]
  },
};

export default nextConfig;
