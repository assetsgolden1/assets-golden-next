import type { Metadata } from 'next'
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Contacte con nuestros expertos en inmobiliaria de lujo. Consultas confidenciales sobre compra, venta o inversión. Respondemos en menos de 24 horas.',
  alternates: {
    canonical: '/contacto',
  },
  openGraph: {
    url: '/contacto',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'RealEstateAgent'],
  '@id': 'https://assetsgolden.com/#organization',
  name: 'Assets Golden',
  description: 'Consultoría inmobiliaria internacional especializada en propiedades de lujo',
  url: 'https://assetsgolden.com',
  telephone: '+34611853001',
  email: 'hola@assetsgolden.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'José Agustín Goytisolo, 31, L5',
    postalCode: '08970',
    addressLocality: 'Sant Joan Despí',
    addressRegion: 'Cataluña',
    addressCountry: 'ES',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '08:00',
    closes: '20:00',
  },
}

const contactItems = [
  {
    Icon: MapPin,
    label: 'Dirección',
    value: 'Sant Joan Despí, Barcelona, España',
    href: null,
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
  {
    Icon: MessageCircle,
    label: 'WhatsApp',
    value: '+34 611 85 30 01',
    href: 'https://wa.me/34611853001',
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
              <h2 className="font-display text-2xl font-semibold mb-8">Información de contacto</h2>

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
                      <span className="text-foreground font-medium">{value}</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Horario</p>
                <p className="text-foreground font-medium">Lunes a sábado, 8:00–20:00 h</p>
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
