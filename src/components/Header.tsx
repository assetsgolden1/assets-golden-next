"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, Search, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DemandDialog from "@/components/DemandDialog";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Header() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demandOpen, setDemandOpen] = useState(false);

  const navLinks = [
    { label: t("nav_properties"), href: "/propiedades" },
    { label: t("nav_destinations"), href: "/destinos" },
    { label: t("nav_services"), href: "/servicios" },
    { label: t("nav_about"), href: "/sobre-nosotros" },
    { label: t("nav_investments"), href: "/inversiones" },
    { label: t("nav_blog"), href: "/blog" },
    { label: t("nav_contact"), href: "/contacto" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
        <div className="container-luxury flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Assets Golden" height={80} width={200} className="h-20 w-auto" style={{ objectFit: 'contain', width: '200px' }} priority />
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
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Destacadas chip */}
            <Link
              href="/propiedades?destacadas=true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-full text-xs text-gold font-semibold uppercase tracking-wide transition-colors"
            >
              <Star className="h-3 w-3 fill-gold" />
              {t("featured")}
            </Link>

            {/* Busco propiedad */}
            <button
              onClick={() => setDemandOpen(true)}
              className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
              aria-label={t("search_aria")}
            >
              <Search className="h-4 w-4" />
              <span>{t("search_property")}</span>
            </button>

            {/* Selector idioma */}
            <LocaleSwitcher />

            <Link
              href="/contacto"
              className={buttonVariants({ variant: "gold", size: "sm" })}
            >
              {t("free_consultation")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-primary-foreground/70 hover:text-primary-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("menu_aria")}
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
                  {link.label}
                </Link>
              ))}
              {/* Accesos directos extra (solo mobile) */}
              <Link
                href="/propiedades?destacadas=true"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-base font-medium rounded transition-colors text-gold hover:bg-primary-foreground/5 flex items-center gap-2"
              >
                <Star className="h-4 w-4 fill-gold" />
                {t("featured")}
              </Link>
              <Link
                href="/mi-demanda"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 text-base font-medium rounded transition-colors",
                  pathname === "/mi-demanda"
                    ? "text-gold bg-primary-foreground/5"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                )}
              >
                {t("my_demand")}
              </Link>
              <div className="mt-4 pt-4 border-t border-primary-foreground/10 flex flex-col gap-3">
                <button
                  onClick={() => { setDemandOpen(true); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span>{t("search_property_mobile")}</span>
                </button>
                <div className="px-4">
                  <LocaleSwitcher />
                </div>
                <Link
                  href="/contacto"
                  onClick={() => setMobileOpen(false)}
                  className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mx-4")}
                >
                  {t("free_consultation")}
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
