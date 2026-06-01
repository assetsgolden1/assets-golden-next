import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import OpenPreferencesButton from "@/components/cookies/OpenPreferencesButton";

export default async function Footer() {
  const t = await getTranslations("Footer");

  const footerLinks = {
    empresa: [
      { label: t("link_about"), href: "/sobre-nosotros" },
      { label: t("link_team"), href: "/equipo" },
      { label: t("link_partners"), href: "/partners" },
      { label: t("link_blog"), href: "/blog" },
      { label: t("link_contact"), href: "/contacto" },
      { label: t("link_agent_access"), href: "/portal/login" },
    ],
    servicios: [
      { label: t("link_buy"), href: "/propiedades" },
      { label: t("link_invest"), href: "/destinos" },
      { label: t("link_tax"), href: "/servicios" },
      { label: t("link_wealth"), href: "/servicios" },
    ],
    destinos: [
      { label: t("dest_spain"), href: "/destinos/espana" },
      { label: t("dest_usa"), href: "/destinos/estados-unidos" },
      { label: t("dest_uae"), href: "/destinos/emiratos-arabes-unidos" },
      { label: t("dest_all"), href: "/destinos" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column (spans 2 on large) */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="Assets Golden" height={112} width={280} className="h-28 w-auto" />
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs mb-6">
              {t("tagline")}
            </p>
            {/* Contact */}
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>{t("address")}</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <a href="tel:+34611853001" className="hover:text-gold transition-colors">
                  +34 611 85 30 01
                </a>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <a href="mailto:hola@assetsgolden.com" className="hover:text-gold transition-colors">
                  hola@assetsgolden.com
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-gold mb-4 font-medium">
              {t("section_company")}
            </h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-gold mb-4 font-medium">
              {t("section_services")}
            </h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinos */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-gold mb-4 font-medium">
              {t("section_destinations")}
            </h4>
            <ul className="space-y-2">
              {footerLinks.destinos.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-gold via-gold/50 to-transparent" />

      {/* Bottom bar */}
      <div className="container-luxury py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/40">
        <p>© {new Date().getFullYear()} COVA FUMADA GROUP S.L. {t("copyright")}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center sm:justify-end">
          <Link href="/aviso-legal" className="hover:text-gold transition-colors">
            {t("legal_notice")}
          </Link>
          <Link href="/politica-de-privacidad" className="hover:text-gold transition-colors">
            {t("privacy_policy")}
          </Link>
          <Link href="/politica-de-cookies" className="hover:text-gold transition-colors">
            {t("cookies_policy")}
          </Link>
          <OpenPreferencesButton />
        </div>
      </div>
    </footer>
  );
}
