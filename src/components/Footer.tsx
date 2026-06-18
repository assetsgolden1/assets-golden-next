import Image from "next/image";
import { MapPin, Phone, Mail, Building2 } from "lucide-react";
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
            {/* Redes sociales */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.linkedin.com/company/assets-golden/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="text-primary-foreground/60 hover:text-gold transition-colors"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/assetsgolden.consulting/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="text-primary-foreground/60 hover:text-gold transition-colors"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.fotocasa.es/es/inmobiliaria-assets-golden-international-real-estate-consulting/comprar/inmuebles/espana/todas-las-zonas/l?clientId=9202776098940&publisherId=2e46de12-5bb4-4fa3-b91d-2d768640e918"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fotocasa"
                title="Fotocasa"
                className="text-primary-foreground/60 hover:text-gold transition-colors"
              >
                <Building2 className="h-5 w-5" />
              </a>
            </div>
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
