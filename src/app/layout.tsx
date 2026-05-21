import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import GlobalSchemaOrg from "@/components/seo/GlobalSchemaOrg";
import MetaPixelPageViewTracker from "@/components/analytics/MetaPixel";

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
    default: "Assets Golden — Inmobiliaria de Lujo Internacional",
    template: "%s — Assets Golden",
  },
  description:
    "Propiedades exclusivas en los mejores destinos del mundo. Compra, vende e invierte con expertos en inmobiliaria de lujo internacional.",
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
    title: 'Assets Golden — Inmobiliaria de Lujo Internacional',
    description:
      'Propiedades exclusivas en los mejores destinos del mundo. Compra, vende e invierte con expertos en inmobiliaria de lujo internacional.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Assets Golden — Inmobiliaria de Lujo Internacional',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <GlobalSchemaOrg />
        <link rel="preconnect" href="https://mromkwpqrxpxbbxhdofs.supabase.co" />
        <link rel="preconnect" href="https://wloneprkibfjioxwypaw.supabase.co" />
        <link rel="preconnect" href="https://medianewbuild.com" />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <MetaPixelPageViewTracker />
      </body>
      {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </html>
  );
}
