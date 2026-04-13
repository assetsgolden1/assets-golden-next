import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eliminar header X-Powered-By
  poweredByHeader: false,

  experimental: {
    optimizeCss: true,
  },

  // Dominios permitidos para next/image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mromkwpqrxpxbbxhdofs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "yagrwbmsufpvjcgxkuoz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "wloneprkibfjioxwypaw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "medianewbuild.com",
      },
    ],
  },

  // Headers de seguridad globales
  async headers() {
    return [
      {
        // 1. Hero images: cache inmutable en edge CDN — DEBE ir primero
        source: '/hero/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 2. Home page: no cache para evitar versión obsoleta en CDN
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
      {
        // 3. CSP global
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' blob: data: https://mromkwpqrxpxbbxhdofs.supabase.co https://wloneprkibfjioxwypaw.supabase.co https://images.unsplash.com https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co https://api.anthropic.com",
              "media-src 'self'",
              "frame-src 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // 4. Security headers globales
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // Redirects: www → non-www (301 permanente)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.assetsgolden.com",
          },
        ],
        destination: "https://assetsgolden.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
