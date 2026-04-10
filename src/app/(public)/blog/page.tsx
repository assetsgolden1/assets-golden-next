import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Blog Inmobiliario | Assets Golden',
  description:
    'Artículos y análisis sobre el mercado inmobiliario de lujo en Barcelona y destinos internacionales. Tendencias, consejos e inversión.',
}

export const revalidate = 3600

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const { data: posts } = await getBlogPosts(20)

  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <>
      {/* Header */}
      <section className="gradient-navy py-24">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">
            Análisis y tendencias
          </p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Blog inmobiliario
          </h1>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              Artículos disponibles próximamente.
            </p>
          ) : (
            <>
              {/* Post destacado */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug ?? featured.id}`}
                  className="group mb-16 block"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 card-premium rounded-2xl overflow-hidden">
                    <div className="relative aspect-video lg:aspect-auto min-h-64 bg-muted">
                      {featured.cover_image ? (
                        <Image
                          src={featured.cover_image}
                          alt={featured.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority
                        />
                      ) : (
                        <div className="h-full gradient-navy flex items-center justify-center">
                          <span className="font-display text-3xl text-gold/30">AG</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      {featured.category && (
                        <span className="text-xs tracking-[0.2em] text-gold uppercase mb-3">
                          {featured.category}
                        </span>
                      )}
                      <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl group-hover:text-gold transition-colors leading-tight">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mt-4 text-muted-foreground leading-relaxed line-clamp-3">
                          {featured.excerpt}
                        </p>
                      )}
                      <p className="mt-6 text-xs text-muted-foreground/60">
                        {formatDate(featured.published_at ?? featured.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid de posts */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug ?? post.id}`}
                      className="group card-premium rounded-xl overflow-hidden block"
                    >
                      {/* Cover */}
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {post.cover_image ? (
                          <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="h-full gradient-elegant" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {post.category && (
                          <span className="text-[10px] tracking-[0.2em] text-gold uppercase mb-2 block">
                            {post.category}
                          </span>
                        )}
                        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="mt-4 text-xs text-muted-foreground/50">
                          {formatDate(post.published_at ?? post.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
