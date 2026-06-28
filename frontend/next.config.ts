import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@google/generative-ai'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
};

export default nextConfig;
