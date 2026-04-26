import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug, getAllBlogSlugs } from '@/lib/supabase/queries'
import { buttonVariants } from '@/components/ui/button'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const dynamicParams = true
export const revalidate = 3600

const categoryLabels: Record<string, string> = {
  article: 'Artículo',
  tip: 'Consejo',
  news: 'Noticias',
  market: 'Mercado',
  investment: 'Inversión',
  consejos: 'Consejos',
  inversiones: 'Inversión',
  mercado: 'Mercado',
  noticias: 'Noticias',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: post } = await getBlogPostBySlug(slug)

  if (!post) return { title: 'Artículo no encontrado — Assets Golden' }

  return {
    title: post.title,
    description: post.excerpt?.slice(0, 160) ?? undefined,
    openGraph: {
      type: 'article',
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      ...(post.published_at && {
        publishedTime: post.published_at,
      }),
    },
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const { data: post } = await getBlogPostBySlug(slug)

  if (!post) notFound()

  const heroImage = post.banner_image_url ?? post.cover_image ?? null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: heroImage ? [heroImage] : [],
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: {
      '@type': 'Organization',
      name: 'Assets Golden',
      url: 'https://assetsgolden.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Assets Golden',
      logo: {
        '@type': 'ImageObject',
        url: 'https://assetsgolden.com/logo.png',
      },
    },
    url: `https://assetsgolden.com/blog/${slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://assetsgolden.com/blog/${slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Banner con título overlay — si existe banner_image_url */}
      {post.banner_image_url ? (
        <section className="relative h-[420px] md:h-[520px] overflow-hidden">
          <Image
            src={post.banner_image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-12 pt-20">
            <div className="container-luxury max-w-3xl">
              {post.category && (
                <span className="text-xs tracking-[0.2em] text-gold uppercase mb-4 block">
                  {categoryLabels[post.category] ?? post.category}
                </span>
              )}
              <h1 className="font-display text-3xl font-semibold text-white leading-tight md:text-4xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-4 text-white/70 text-base leading-relaxed max-w-2xl">
                  {post.excerpt}
                </p>
              )}
              <p className="mt-5 text-white/50 text-sm">
                {formatDate(post.published_at ?? post.created_at)} · Por {(post as { author?: string }).author ?? 'Assets Golden'}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Hero sin banner */}
          <section className="gradient-navy pt-16 pb-12">
            <div className="container-luxury max-w-3xl">
              {post.category && (
                <span className="text-xs tracking-[0.2em] text-gold uppercase mb-4 block">
                  {categoryLabels[post.category] ?? post.category}
                </span>
              )}
              <h1 className="font-display text-3xl font-semibold text-white leading-tight md:text-4xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-5 text-white/60 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              <p className="mt-6 text-white/40 text-sm">
                {formatDate(post.published_at ?? post.created_at)}
              </p>
              <p className="mt-2 text-white/50 text-sm">
                Por {(post as { author?: string }).author ?? 'Assets Golden'}
              </p>
            </div>
          </section>

          {/* Cover image (solo si no hay banner) */}
          {post.cover_image && (
            <div className="relative aspect-video max-h-[60vh] overflow-hidden bg-muted">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          )}
        </>
      )}

      {/* Contenido */}
      <section className="section-padding bg-background">
        <div className="container-luxury max-w-3xl">
          {post.content ? (
            <div
              className="prose prose-lg max-w-none text-foreground/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-muted-foreground italic">Contenido no disponible.</p>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-xl gradient-navy p-8 text-center">
            <p className="font-display text-xl font-semibold text-white mb-2">
              ¿Desea saber el valor de su propiedad?
            </p>
            <p className="text-white/60 text-sm mb-6">
              Tasación gratuita y confidencial en menos de 24 horas.
            </p>
            <Link
              href="/vender-tu-piso"
              className={buttonVariants({ variant: 'hero', size: 'lg' })}
            >
              Solicitar tasación gratuita
            </Link>
          </div>

          {/* Volver */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              ← Volver al blog
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
