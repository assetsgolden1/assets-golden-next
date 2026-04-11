import type { Metadata } from 'next'
import { MapPin, Phone, Mail } from 'lucide-react'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contacto — Assets Golden International',
  description:
    'Contacte con nuestro equipo de expertos en inmobiliaria de lujo internacional. Oficina en Barcelona. Respuesta en menos de 24 horas.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Assets Golden International',
  description: 'Consultoría inmobiliaria internacional especializada en propiedades de lujo',
  url: 'https://assetsgolden.com',
  telephone: '+34-611-853-001',
  email: 'hola@assetsgolden.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Passeig de Gràcia',
    addressLocality: 'Barcelona',
    addressRegion: 'Cataluña',
    postalCode: '08008',
    addressCountry: 'ES',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '19:00',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.3917,
    longitude: 2.1649,
  },
}

const contactItems = [
  {
    Icon: MapPin,
    label: 'Dirección',
    value: 'Passeig de Gràcia, Barcelona, España',
    href: undefined,
  },
  {
    Icon: Phone,
    label: 'Teléfono',
    value: '+34 611 85 30 01',
    href: 'tel:+34611853001',
  },
  {
    Icon: Mail,
    label: 'Email',
    value: 'hola@assetsgolden.com',
    href: 'mailto:hola@assetsgolden.com',
  },
]

export default function ContactoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Estamos aquí para ayudarle</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Contacte con nosotros
          </h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-sm">
            Nuestro equipo de especialistas le atenderá en menos de 24 horas.
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="grid gap-12 lg:grid-cols-2">

            {/* Columna izquierda — Datos de contacto */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-semibold mb-8">Nuestra oficina</h2>

              {contactItems.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-foreground hover:text-gold transition-colors font-medium">
                        {value}
                      </a>
                    ) : (
                      <p className="text-foreground font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Horario</p>
                <p className="text-foreground font-medium">Lunes a viernes, 9:00–19:00 h</p>
              </div>

              {/* Mapa */}
              <div className="overflow-hidden rounded-xl border border-border mt-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.9617706685927!2d2.162445615488305!3d41.39178097926355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f40a3b1a41%3A0xa8de12b3fc7a1748!2sPasseig%20de%20Gr%C3%A0cia%2C%20Barcelona!5e0!3m2!1ses!2ses!4v1680000000000!5m2!1ses!2ses"
                  width="100%"
                  height="240"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación oficina Assets Golden Barcelona"
                />
              </div>
            </div>

            {/* Columna derecha — Formulario */}
            <div className="bg-secondary p-8 lg:p-10 rounded-lg">
              <h2 className="font-display text-2xl font-semibold mb-6">Envíenos un mensaje</h2>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
