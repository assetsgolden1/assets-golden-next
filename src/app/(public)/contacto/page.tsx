import type { Metadata } from 'next'
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
            {/* Formulario */}
            <div>
              <h2 className="font-display text-2xl font-semibold mb-6">Envíenos un mensaje</h2>
              <ContactForm />
            </div>

            {/* Datos de contacto + mapa */}
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-semibold mb-6">Nuestra oficina</h2>
                <dl className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <dt className="text-gold font-medium w-20 shrink-0">Dirección</dt>
                    <dd className="text-muted-foreground">Passeig de Gràcia, Barcelona, España</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="text-gold font-medium w-20 shrink-0">Teléfono</dt>
                    <dd>
                      <a href="tel:+34611853001" className="text-foreground hover:text-gold transition-colors">
                        +34 611 85 30 01
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="text-gold font-medium w-20 shrink-0">Email</dt>
                    <dd>
                      <a href="mailto:hola@assetsgolden.com" className="text-foreground hover:text-gold transition-colors">
                        hola@assetsgolden.com
                      </a>
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="text-gold font-medium w-20 shrink-0">Horario</dt>
                    <dd className="text-muted-foreground">Lunes a viernes, 9:00–19:00 h</dd>
                  </div>
                </dl>
              </div>

              {/* Mapa embebido de Google Maps (sin API key) */}
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.9617706685927!2d2.162445615488305!3d41.39178097926355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f40a3b1a41%3A0xa8de12b3fc7a1748!2sPasseig%20de%20Gr%C3%A0cia%2C%20Barcelona!5e0!3m2!1ses!2ses!4v1680000000000!5m2!1ses!2ses"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación oficina Assets Golden Barcelona"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
