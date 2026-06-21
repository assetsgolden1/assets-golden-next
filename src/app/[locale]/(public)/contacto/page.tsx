import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import ContactForm from './ContactForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Contact')
  const locale = await getLocale()
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: buildAlternates('/contacto', locale),
    openGraph: { url: '/contacto' },
  }
}

export default async function ContactoPage() {
  const t = await getTranslations('Contact')
  const locale = await getLocale()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'RealEstateAgent'],
    '@id': 'https://assetsgolden.com/#organization',
    name: 'Assets Golden',
    description: locale === 'en'
      ? 'International exclusive real estate consultancy'
      : 'Consultoría inmobiliaria internacional especializada en propiedades exclusivas',
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
    { key: 'address', Icon: MapPin, label: t('label_address'), value: 'Sant Joan Despí, Barcelona, España', href: null },
    { key: 'phone', Icon: Phone, label: t('label_phone'), value: '+34 611 85 30 01', href: 'tel:+34611853001' },
    { key: 'email', Icon: Mail, label: t('label_email'), value: 'hola@assetsgolden.com', href: 'mailto:hola@assetsgolden.com' },
    { key: 'whatsapp', Icon: MessageCircle, label: t('label_whatsapp'), value: '+34 611 85 30 01', href: 'https://wa.me/34611853001' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('hero_eyebrow')}</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">{t('hero_title')}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-sm">{t('hero_subtitle')}</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="grid gap-12 lg:grid-cols-2">

            <div className="space-y-6">
              <h2 className="font-display text-2xl font-semibold mb-8">{t('info_title')}</h2>

              {contactItems.map(({ key, Icon, label, value, href }) => (
                <div key={key} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-foreground hover:text-gold transition-colors font-medium">{value}</a>
                    ) : (
                      <span className="text-foreground font-medium">{value}</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">{t('label_schedule')}</p>
                <p className="text-foreground font-medium">{t('schedule_value')}</p>
              </div>
            </div>

            <div className="bg-secondary p-8 lg:p-10 rounded-lg">
              <h2 className="font-display text-2xl font-semibold mb-6">{t('form_title')}</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
