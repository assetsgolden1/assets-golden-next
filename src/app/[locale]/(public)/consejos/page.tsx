import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Consejos Inmobiliarios',
  description:
    'Guía práctica para compradores, vendedores e inversores inmobiliarios. Consejos de expertos para tomar las mejores decisiones.',
  alternates: {
    canonical: '/consejos',
  },
  openGraph: {
    url: '/consejos',
  },
}

export const revalidate = 3600

// Consejos estáticos de respaldo (si no hay datos en BD)
const STATIC_TIPS = [
  {
    icon: '🏠',
    title: 'Para compradores',
    items: [
      'Define tu presupuesto máximo incluyendo gastos de escritura (10–15% adicional)',
      'Solicita siempre una nota simple registral antes de firmar',
      'Compara mínimo 3 opciones de financiación hipotecaria',
      'Contrata un arquitecto para revisar el estado del inmueble',
      'Negocia las condiciones: precio, plazos y arras',
    ],
  },
  {
    icon: '💰',
    title: 'Para vendedores',
    items: [
      'Realiza una tasación profesional antes de fijar el precio',
      'Prepara el certificado energético con antelación',
      'Invierte en home staging para mejorar la presentación',
      'Ten toda la documentación en orden: escrituras, IBI, comunidad',
      'Trabaja con agentes especializados en tu zona',
    ],
  },
  {
    icon: '📈',
    title: 'Para inversores',
    items: [
      'Calcula el ROI neto descontando gastos de comunidad, IBI y mantenimiento',
      'Analiza la demanda de alquiler en la zona antes de comprar',
      'Diversifica entre distintas zonas geográficas',
      'Considera el potencial de revalorización a 5–10 años',
      'Consulta el régimen fiscal antes de estructurar la inversión',
    ],
  },
  {
    icon: '🌍',
    title: 'Para compradores internacionales',
    items: [
      'Obtén el NIE (Número de Identificación de Extranjero) antes de firmar',
      'Abre una cuenta bancaria en España para la operación',
      'Contrata un abogado local independiente del vendedor',
      'Revisa las restricciones a la compra según tu nacionalidad',
      'Planifica los costes de remesa y tipo de cambio',
    ],
  },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ConsejosPage({ params }: Props) {
  const { locale } = await params
  const { data: posts } = await getBlogPostsByCategory('tip', locale)

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Guía práctica</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Consejos Inmobiliarios
          </h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-sm">
            Consejos prácticos de nuestros expertos para tomar las mejores decisiones en su inversión inmobiliaria.
          </p>
        </div>
      </section>

      {/* Posts del blog (si existen) */}
      {posts.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-luxury">
            <h2 className="font-display text-2xl font-semibold mb-8">Artículos recientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug ?? post.id}`}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-gold/30 hover:shadow-lg transition-all"
                >
                  {post.cover_image && (
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground mb-2">{formatDate(post.published_at)}</p>
                    <h3 className="font-display text-base font-semibold group-hover:text-gold transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Consejos estáticos */}
      <section className={`section-padding ${posts.length > 0 ? 'bg-muted/30' : 'bg-background'}`}>
        <div className="container-luxury">
          {posts.length === 0 && (
            <h2 className="font-display text-2xl font-semibold mb-8">Guía práctica</h2>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            {STATIC_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="rounded-xl border border-border bg-card p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">{tip.icon}</span>
                  <h3 className="font-display text-xl font-semibold">{tip.title}</h3>
                </div>
                <ul className="space-y-3">
                  {tip.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-14">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-3">
            ¿Necesita asesoramiento personalizado?
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Nuestros especialistas le guiarán en cada etapa de su operación.
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
            Consulta gratuita
          </Link>
        </div>
      </section>
    </>
  )
}
