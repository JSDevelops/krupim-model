import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@google/generative-ai'],
  images: {
    remotePatterns: [
      // Supabase Storage (project avatars, thumbnails)
      { protocol: 'https', hostname: 'zzkgzbdvyeansjxsylgw.supabase.co' },
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
