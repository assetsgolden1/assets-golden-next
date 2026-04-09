import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eliminar header X-Powered-By
  poweredByHeader: false,

  // Dominios permitidos para next/image
  images: {
    remotePatterns: [
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
    ],
  },

  // Headers de seguridad globales
  async headers() {
    return [
      {
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
