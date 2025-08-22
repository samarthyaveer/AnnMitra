import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['hxosmqwwgjxzuxsduado.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Headers for security and PWA
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/offline.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
