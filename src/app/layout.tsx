import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Assets Golden — Inmobiliaria de Lujo Internacional",
    template: "%s — Assets Golden",
  },
  description:
    "Propiedades exclusivas en los mejores destinos del mundo. Compra, vende e invierte con expertos en inmobiliaria de lujo internacional.",
  metadataBase: new URL("https://assetsgolden.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}
