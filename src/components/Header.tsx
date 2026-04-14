"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DemandDialog from "@/components/DemandDialog";

const navLinks = [
  { label: "Propiedades", labelEn: "Properties", href: "/propiedades" },
  { label: "Destinos", labelEn: "Destinations", href: "/destinos" },
  { label: "Servicios", labelEn: "Services", href: "/servicios" },
  { label: "Nosotros", labelEn: "About us", href: "/sobre-nosotros" },
  { label: "Inversiones", labelEn: "Investments", href: "/inversiones" },
  { label: "Blog", labelEn: "Blog", href: "/blog" },
  { label: "Contacto", labelEn: "Contact", href: "/contacto" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");
  const [demandOpen, setDemandOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
        <div className="container-luxury flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Assets Golden" height={80} width={200} className="h-20 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded",
                  pathname === link.href
                    ? "text-gold"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                )}
              >
                {lang === "es" ? link.label : link.labelEn}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Busco propiedad */}
            <button
              onClick={() => setDemandOpen(true)}
              className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
              aria-label="Busco propiedad"
            >
              <Search className="h-4 w-4" />
              <span>{lang === "es" ? "Busco propiedad" : "I'm looking"}</span>
            </button>

            {/* Selector idioma */}
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
              aria-label="Cambiar idioma"
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium uppercase">{lang}</span>
            </button>

            <Link
              href="/contacto"
              className={buttonVariants({ variant: "gold", size: "sm" })}
            >
              {lang === "es" ? "Asesoría gratuita" : "Free consultation"}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-primary-foreground/70 hover:text-primary-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-primary border-t border-primary-foreground/10 max-h-[80vh] overflow-y-auto">
            <nav className="container-luxury py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 text-base font-medium rounded transition-colors",
                    pathname === link.href
                      ? "text-gold bg-primary-foreground/5"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  )}
                >
                  {lang === "es" ? link.label : link.labelEn}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-primary-foreground/10 flex flex-col gap-3">
                <button
                  onClick={() => { setDemandOpen(true); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span>{lang === "es" ? "Busco propiedad" : "I'm looking for a property"}</span>
                </button>
                <button
                  onClick={() => setLang(lang === "es" ? "en" : "es")}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>{lang === "es" ? "Switch to English" : "Cambiar a Español"}</span>
                </button>
                <Link
                  href="/contacto"
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mx-4")}
                >
                  {lang === "es" ? "Asesoría gratuita" : "Free consultation"}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <DemandDialog open={demandOpen} onClose={() => setDemandOpen(false)} />
    </>
  );
}
