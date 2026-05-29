import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, TrendingUp, Building2, MapPin } from 'lucide-react'
import { getBlogPostsByCategory } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Noticias del Mercado Inmobiliario',
  description:
    'Últimas noticias y novedades del mercado inmobiliario internacional. Tendencias, análisis y actualizaciones de Assets Golden.',
  alternates: {
    canonical: '/noticias',
  },
  openGraph: {
    url: '/noticias',
  },
}

export const revalidate = 3600

// Noticias de respaldo (hardcoded — igual que en Lovable)
const STATIC_NEWS = [
  {
    id: 1,
    icon: TrendingUp,
    date: '2026-03-15',
    category: 'Mercado',
    title: 'El mercado inmobiliario español crece un 8% en el primer trimestre de 2026',
    content:
      'Los precios de la vivienda en España continúan su tendencia alcista, especialmente en zonas costeras y grandes ciudades. Barcelona y Madrid lideran la demanda internacional.',
  },
  {
    id: 2,
    icon: Building2,
    date: '2026-02-28',
    category: 'Empresa',
    title: 'Assets Golden consolida su red de colaboradores con nuevas incorporaciones en Europa y Latinoamérica',
    content:
      'La expansión de nuestra red de partners independientes en 11 países refuerza nuestra capacidad para ofrecer oportunidades exclusivas en los mercados de lujo internacional.',
  },
  {
    id: 3,
    icon: MapPin,
    date: '2026-01-20',
    category: 'Expansión',
    title: 'Expansión a nuevos mercados en Latinoamérica: México y Argentina',
    content:
      'Anunciamos nuestra entrada en los mercados de México y Argentina, ofreciendo oportunidades de inversión en mercados emergentes con alto potencial de revalorización.',
  },
  {
    id: 4,
    icon: TrendingUp,
    date: '2025-12-10',
    category: 'Tendencias',
    title: 'La Costa del Sol lidera el interés de compradores internacionales en 2025',
    content:
      'La demanda de propiedades en la Costa del Sol por parte de compradores europeos alcanza máximos históricos, con compradores del norte de Europa encabezando el interés.',
  },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function NoticiasPage() {
  const { data: posts } = await getBlogPostsByCategory('news')

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Novedades</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Últimas Noticias
          </h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-sm">
            Mantente al día con las últimas novedades de Assets Golden y el mercado inmobiliario internacional.
          </p>
        </div>
      </section>

      {/* Posts del blog */}
      {posts.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-luxury max-w-4xl">
            <h2 className="font-display text-2xl font-semibold mb-8">Artículos recientes</h2>
            <div className="space-y-6 mb-10">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug ?? post.id}`}
                  className="group flex flex-col md:flex-row gap-6 rounded-xl border border-border bg-card p-6 hover:border-gold/30 hover:shadow-lg transition-all"
                >
                  {post.cover_image && (
                    <div className="relative h-36 md:h-28 md:w-44 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {post.category && (
                        <span className="text-xs font-medium uppercase tracking-wide text-gold">{post.category}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.published_at ?? post.created_at)}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold group-hover:text-gold transition-colors mb-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Noticias estáticas */}
      <section className={`section-padding ${posts.length > 0 ? 'bg-muted/30' : 'bg-background'}`}>
        <div className="container-luxury max-w-4xl">
          {posts.length === 0 && (
            <h2 className="font-display text-2xl font-semibold mb-8">Noticias destacadas</h2>
          )}
          <div className="space-y-6">
            {STATIC_NEWS.map(({ id, icon: Icon, date, category, title, content }) => (
              <article
                key={id}
                className="group flex flex-col md:flex-row gap-6 rounded-xl border border-border bg-card p-6 md:p-8 hover:border-gold/30 hover:shadow-lg transition-all"
              >
                <div className="shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 transition-colors group-hover:bg-gold/20">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-gold">{category}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(date)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-gold transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{content}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
