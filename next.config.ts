import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance: compress responses
  compress: true,

  // Cache and security headers
  async headers() {
    return [
      {
        // Static assets — aggressive caching
        source: '/(.*\\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // HTML pages — stale-while-revalidate for speed
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
