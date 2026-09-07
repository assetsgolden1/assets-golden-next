import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import MetaPixelPageViewTracker from "@/components/analytics/MetaPixel";
import CookieConsentInit from "@/components/cookies/CookieConsentInit";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Assets Golden — Inmobiliaria Internacional de Propiedades Exclusivas",
    template: "%s — Assets Golden",
  },
  description:
    "Propiedades exclusivas en los mejores destinos del mundo. Compra, vende e invierte con expertos en propiedades exclusivas a nivel internacional.",
  metadataBase: new URL("https://assetsgolden.com"),

  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },

  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://assetsgolden.com',
    siteName: 'Assets Golden',
    title: 'Assets Golden — Inmobiliaria Internacional de Propiedades Exclusivas',
    description:
      'Propiedades exclusivas en los mejores destinos del mundo. Compra, vende e invierte con expertos en propiedades exclusivas a nivel internacional.',
    images: [
      {
        // España hero image — used as global og:image fallback for pages
        // without a specific image (home, destinos, servicios, etc.)
        url: 'https://assetsgolden.com/og/default.jpg',
        width: 1200,
        height: 630,
        alt: 'Assets Golden — Inmobiliaria Internacional de Propiedades Exclusivas',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    images: ['https://assetsgolden.com/og/default.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  verification: {
    google: '_PodCQHuUTmkjLHShE5nV4Pm3DYb3XqxXCzC_Cqx5Gg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // lang estático = 'es' (default). NO usamos getLocale() acá porque leería el
  // request y forzaría render dinámico en TODAS las rutas. El locale real (y el
  // <html lang> correcto en /en) lo maneja el layout [locale] vía setRequestLocale
  // + HtmlLangSync. admin/portal/api son ES → lang="es" correcto.
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://mromkwpqrxpxbbxhdofs.supabase.co" />
        <link rel="preconnect" href="https://medianewbuild.com" />
        {/* Proxy de imágenes del feed HabiHub (ver lib/utils/optimizedImage) */}
        <link rel="preconnect" href="https://wsrv.nl" />
        {/*
          Corrige <html lang> ANTES del primer paint en /en. El atributo se
          sirve estático "es" (leer el locale en el root layout forzaría render
          dinámico en todo el sitio); este script bloqueante lo fija según el
          pathname, así el DOM renderizado (el que indexa Googlebot) ya es
          correcto. HtmlLangSync sigue cubriendo las navegaciones SPA.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var p=location.pathname;document.documentElement.lang=(p==='/en'||p.indexOf('/en/')===0)?'en':'es'})()",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        {/*
          MetaPixelPageViewTracker: fires fbq('track','PageView') on SPA
          navigation — only executes if window.fbq exists, which only happens
          after the user grants marketing consent via CookieConsentInit.
        */}
        <MetaPixelPageViewTracker />
        {/*
          CookieConsentInit: shows GDPR cookie banner on first visit and
          manages consent state. Loads Meta Pixel dynamically ONLY when
          the user accepts the "marketing" category.
          The always-on <Script id="meta-pixel"> block has been removed —
          the Pixel is now consent-gated.
        */}
        {/*
          CookieConsentInit también carga GA4 (gtag.js) dinámicamente SOLO
          tras aceptar la categoría "analytics" — RGPD. El <GoogleAnalytics>
          estático se quitó de acá para no inyectar gtag.js sin consentimiento.
          El CSP ya permite googletagmanager.com y google-analytics.com.
        */}
        <CookieConsentInit />
      </body>
    </html>
  );
}
