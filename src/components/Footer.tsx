import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

const footerLinks = {
  empresa: [
    { label: "Sobre Nosotros", href: "/sobre-nosotros" },
    { label: "Equipo", href: "/equipo" },
    { label: "Red de Partners", href: "/partners" },
    { label: "Blog", href: "/blog" },
    { label: "Contacto", href: "/contacto" },
  ],
  servicios: [
    { label: "Compra de propiedades", href: "/propiedades" },
    { label: "Inversión internacional", href: "/destinos" },
    { label: "Asesoría fiscal", href: "/servicios" },
    { label: "Gestión patrimonial", href: "/servicios" },
  ],
  destinos: [
    { label: "España", href: "/destinos/espana" },
    { label: "Estados Unidos", href: "/destinos/estados-unidos" },
    { label: "Emiratos Árabes", href: "/destinos/emiratos-arabes-unidos" },
    { label: "Ver todos", href: "/destinos" },
  ],
};

export default function Footer() {
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
              Expertos en inmobiliaria de lujo internacional. Conectamos
              inversores con las mejores oportunidades en más de 15 países.
            </p>
            {/* Contact */}
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>Barcelona, España</span>
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
              Empresa
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
              Servicios
            </h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.href}>
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
              Destinos
            </h4>
            <ul className="space-y-2">
              {footerLinks.destinos.map((link) => (
                <li key={link.href}>
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
        <p>© {new Date().getFullYear()} COVA FUMADA GROUP S.L. Todos los derechos reservados.</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center sm:justify-end">
          <Link href="/aviso-legal" className="hover:text-gold transition-colors">
            Aviso legal
          </Link>
          <Link href="/politica-de-privacidad" className="hover:text-gold transition-colors">
            Política de privacidad
          </Link>
          <Link href="/politica-de-cookies" className="hover:text-gold transition-colors">
            Política de cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
