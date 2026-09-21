import type { NextConfig } from "next";
import { withBotId } from 'botid/next/config'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Eliminar header X-Powered-By
  poweredByHeader: false,

  // Puppeteer has native binaries — keep it server-side only, never bundle
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium-min'],

  experimental: {
    optimizeCss: true,
  },

  // Dominios permitidos para next/image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecvaqiotrzdjokaevsrz.supabase.co",
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
      {
        // Proxy de imágenes para el CDN del feed (ver lib/utils/optimizedImage)
        protocol: "https",
        hostname: "wsrv.nl",
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
        // 2. Home page: ISR 1h en CDN, stale-while-revalidate 24h
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
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
              // Meta Pixel SDK (connect.facebook.net) + GA4 tag manager
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // www.facebook.com: pixel beacon img; google-analytics: GA4 measurement
              "img-src 'self' blob: data: https://ecvaqiotrzdjokaevsrz.supabase.co https://*.supabase.co https://images.unsplash.com https://source.unsplash.com https://medianewbuild.com https://wsrv.nl https://www.facebook.com https://www.google-analytics.com https://*.google-analytics.com",
              // Meta Pixel XHR + GA4 measurement protocol
              "connect-src 'self' https://*.supabase.co https://www.facebook.com https://connect.facebook.net https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
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

  // Redirects: www → non-www (301 permanente) + slugs legacy de Lovable
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
      {
        source: '/oportunidades-de-inversion',
        destination: '/inversiones',
        permanent: true,
      },
      {
        source: '/quiero-vender-mi-propiedad',
        destination: '/vender-tu-piso',
        permanent: true,
      },
      {
        source: '/whatsapp',
        destination: '/',
        permanent: false,
      },
      // Slugs en inglés de Lovable indexados por Google
      { source: '/contact',      destination: '/contacto',       permanent: true },
      { source: '/properties',   destination: '/propiedades',    permanent: true },
      { source: '/investments',  destination: '/inversiones',    permanent: true },
      { source: '/sell',         destination: '/vender-tu-piso', permanent: true },
      { source: '/about',        destination: '/sobre-nosotros', permanent: true },
      { source: '/services',     destination: '/servicios',      permanent: true },
      { source: '/promotions',   destination: '/promociones',    permanent: true },
      { source: '/team',         destination: '/equipo',         permanent: true },
      { source: '/destinations', destination: '/destinos',       permanent: true },
      { source: '/news',         destination: '/noticias',       permanent: true },
      { source: '/tips',         destination: '/consejos',       permanent: true },
      { source: '/my-demand',    destination: '/mi-demanda',     permanent: true },
    ];
  },
};

export default withBotId(withNextIntl(nextConfig));
