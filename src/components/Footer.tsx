import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const footerLinks = {
  empresa: [
    { label: "Sobre Nosotros", href: "/sobre-nosotros" },
    { label: "Equipo", href: "/equipo" },
    { label: "Blog", href: "/blog" },
    { label: "Contacto", href: "/contacto" },
  ],
  servicios: [
    { label: "Compra de propiedades", href: "/propiedades" },
    { label: "Inversión internacional", href: "/destinos" },
    { label: "Asesoría fiscal", href: "/contacto" },
    { label: "Gestión patrimonial", href: "/contacto" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column (spans 2 on large) */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl font-semibold text-primary-foreground">
                Assets Golden
              </span>
              <br />
              <span className="text-[10px] tracking-[0.2em] text-gold uppercase">
                International Real Estate Consulting
              </span>
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
        <p>© {new Date().getFullYear()} CFG Global Investment S.L. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacidad" className="hover:text-gold transition-colors">
            Política de privacidad
          </Link>
          <span className="opacity-50">·</span>
          <span className="text-primary-foreground/30">
            Partner of Nest Seekers International
          </span>
        </div>
      </div>
    </footer>
  );
}
