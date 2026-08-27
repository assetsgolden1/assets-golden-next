import type { Metadata } from 'next'
import Breadcrumb from '@/components/seo/Breadcrumb'
import Link from 'next/link'
import {
  Building2,
  Store,
  Landmark,
  MapPinned,
  Hotel,
  Trees,
  TrendingUp,
  Globe,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { buildAlternates } from '@/lib/utils/seoAlternates'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  return {
  title: 'Servicios Inmobiliarios',
  description:
    'Asesoramiento experto en compra, venta e inversión de propiedades exclusivas en España y mercados internacionales. Due diligence completo en cada operación.',
  alternates: buildAlternates('/servicios', locale),
  openGraph: { url: locale === 'en' ? '/en/servicios' : '/servicios' },
}
}

const SERVICES = [
  {
    icon: Building2,
    title: 'Pisos y Apartamentos',
    desc: 'Selección exclusiva de viviendas residenciales en las mejores ubicaciones urbanas y costeras de Europa y América.',
    benefits: [
      'Acceso a propiedades off-market',
      'Due diligence legal completo',
      'Asesoramiento en financiación',
      'Gestión postventa',
    ],
  },
  {
    icon: Store,
    title: 'Locales Comerciales',
    desc: 'Identificación y adquisición de activos comerciales con alto potencial de rentabilidad en zonas prime.',
    benefits: [
      'Análisis de rentabilidad',
      'Estudio de viabilidad comercial',
      'Negociación de condiciones',
      'Gestión de contratos',
    ],
  },
  {
    icon: Landmark,
    title: 'Edificios',
    desc: 'Operaciones de gran envergadura: edificios residenciales, comerciales y de uso mixto para inversores institucionales.',
    benefits: [
      'Valoraciones independientes',
      'Estructuración de la inversión',
      'Gestión de activos',
      'Informes periódicos',
    ],
  },
  {
    icon: MapPinned,
    title: 'Solares y Terrenos',
    desc: 'Oportunidades de desarrollo inmobiliario en parcelas estratégicas para proyectos residenciales y comerciales.',
    benefits: [
      'Análisis urbanístico',
      'Potencial de desarrollo',
      'Contacto con promotores',
      'Permisos y licencias',
    ],
  },
  {
    icon: Hotel,
    title: 'Hoteles y Establecimientos',
    desc: 'Compraventa y asesoramiento en activos hoteleros y de hostelería en destinos turísticos de alto valor.',
    benefits: [
      'Valoración hotelera especializada',
      'Análisis RevPAR y ocupación',
      'Conexión con operadores',
      'Estrategia de marca',
    ],
  },
  {
    icon: Trees,
    title: 'Fincas Rústicas',
    desc: 'Propiedades rurales exclusivas: fincas, masías, cortijos y viñedos en los entornos naturales más privilegiados.',
    benefits: [
      'Valoración agronómica',
      'Análisis de explotación',
      'Aspectos legales rurales',
      'Potencial agro-turístico',
    ],
  },
]

const ADDITIONAL = [
  {
    icon: TrendingUp,
    title: 'Inversión Inmobiliaria',
    desc: 'Asesoramiento estratégico para maximizar la rentabilidad de su cartera inmobiliaria en mercados internacionales. Análisis de mercado, yields y perspectivas de revalorización.',
  },
  {
    icon: Globe,
    title: 'Asesoramiento Internacional',
    desc: 'Guía completa para inversores extranjeros: aspectos fiscales, legales y prácticos para invertir en España y otros mercados europeos y americanos.',
  },
  {
    icon: ShieldCheck,
    title: 'Gestión de Patrimonio',
    desc: 'Servicio integral de gestión y optimización de carteras inmobiliarias para familias e inversores con múltiples activos en diferentes jurisdicciones.',
  },
]

const FAQS = [
  {
    q: '¿Qué tipo de propiedades comercializa Assets Golden?',
    a: 'Trabajamos pisos y apartamentos, locales comerciales, edificios, solares y terrenos, hoteles y establecimientos, y fincas rústicas. Cada operación incluye due diligence legal completo.',
  },
  {
    q: '¿En qué países opera Assets Golden?',
    a: 'Estamos presentes en 13 países a través de nuestra red de partners: España, México, Indonesia (Bali), Emiratos Árabes Unidos (Dubái), Argentina, Brasil, Estados Unidos, Costa Rica, República Dominicana, Reino Unido, Ecuador, Grecia y Paraguay. Abrimos nuevos mercados de forma permanente.',
  },
  {
    q: '¿Trabajan con compradores e inversores extranjeros?',
    a: 'Sí. Ofrecemos asesoramiento internacional integral —aspectos fiscales, legales y prácticos— para invertir en España y otros mercados europeos y americanos. Atendemos en español e inglés.',
  },
  {
    q: '¿Qué es una propiedad off-market y por qué importa?',
    a: 'Son propiedades que no se publican en los portales habituales. A través de nuestra red exclusiva accedemos a estos activos de forma discreta, a menudo antes de que lleguen al mercado abierto.',
  },
  {
    q: '¿Ofrecen due diligence y acompañamiento legal?',
    a: 'Sí. Realizamos un due diligence completo en cada operación y acompañamos en la negociación, la financiación y la gestión postventa.',
  },
  {
    q: '¿Cómo solicito una consulta?',
    a: 'Puede contarnos su proyecto desde la página de contacto y le asignaremos el especialista adecuado. La consulta inicial es gratuita y sin compromiso.',
  },
]

export default function ServiciosPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <>
      <Breadcrumb items={[
        { name: 'Inicio', url: '/' },
        { name: 'Servicios', url: '/servicios' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Nuestros servicios</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Soluciones Inmobiliarias
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-sm leading-relaxed">
            Somos un equipo de profesionales con amplia experiencia en el sector inmobiliario e inversiones en todo el mundo. Disponemos de partners en 13 países.
          </p>
        </div>
      </section>

      {/* Servicios principales */}
      <section className="gradient-navy py-16">
        <div className="container-luxury">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc, benefits }) => (
              <div
                key={title}
                className="group rounded-xl border border-white/10 p-8 transition-all hover:border-gold/30 hover:bg-white/5"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-gold/10 transition-colors group-hover:bg-gold/20">
                  <Icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-1.5">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-white/70">
                      <span className="text-gold">›</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios adicionales */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold mb-3">Servicios de asesoramiento</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Más allá de la compraventa, ofrecemos acompañamiento estratégico en cada etapa de su inversión.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ADDITIONAL.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border p-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red de países */}
      <section className="py-12 bg-muted/30">
        <div className="container-luxury text-center">
          <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Presencia internacional</p>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Partners inmobiliarios en <strong className="text-foreground">España, México, Indonesia (Bali), Emiratos Árabes Unidos (Dubái), Argentina, Estados Unidos, Costa Rica, Reino Unido, Ecuador, Grecia y Paraguay</strong>. Permanentemente abrimos nuevos mercados en busca de mejores oportunidades para nuestros clientes.
          </p>
          <div className="mt-6">
            <Link href="/partners" className={buttonVariants({ variant: 'goldOutline', size: 'sm' })}>
              Conocer a nuestros partners
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background">
        <div className="container-luxury max-w-3xl">
          <div className="mb-10 text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Preguntas frecuentes</p>
            <h2 className="font-display text-3xl font-semibold">Sobre nuestros servicios</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-border bg-card px-5 py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-foreground list-none">
                  {q}
                  <span className="text-gold text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            ¿Cómo podemos ayudarle?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Cuéntenos su proyecto y le asignaremos el especialista adecuado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
              Consulta gratuita <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/propiedades" className={buttonVariants({ variant: 'outline' })}>
              Ver propiedades
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
