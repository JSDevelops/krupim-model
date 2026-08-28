import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@google/generative-ai', 'nodemailer', 'pg'],
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
      ],
    }]
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
    ]
  },
};

export default nextConfig;
