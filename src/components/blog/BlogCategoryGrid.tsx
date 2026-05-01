import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  consejos: 'Consejos',
  noticias: 'Noticias',
  inversiones: 'Inversiones',
  mercado: 'Mercado',
  tip: 'Consejos',
  news: 'Noticias',
  article: 'Artículo',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

interface Props {
  posts: BlogPost[]
  category: string
}

export default function BlogCategoryGrid({ posts, category }: Props) {
  const label = CATEGORY_LABELS[category] ?? category

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Blog</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">{label}</h1>
          <div className="mt-6 h-px w-12 bg-gold mx-auto" />
        </div>
      </section>

      {/* Filtros de categoría */}
      <section className="border-b border-border bg-background sticky top-20 z-30">
        <div className="container-luxury py-3 flex gap-2 overflow-x-auto">
          {['consejos', 'noticias', 'inversiones', 'mercado'].map((cat) => (
            <Link
              key={cat}
              href={`/blog/${cat}`}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors border ${
                cat === category
                  ? 'bg-gold text-navy border-gold'
                  : 'border-border text-muted-foreground hover:border-gold hover:text-foreground'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
          <Link
            href="/blog"
            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border border-border text-muted-foreground hover:border-gold hover:text-foreground transition-colors"
          >
            Todos
          </Link>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-4">No hay artículos en esta categoría todavía.</p>
              <Link href="/blog" className="text-sm text-gold hover:underline">
                Ver todos los artículos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug ?? post.id}`}
                  className="group card-premium rounded-xl overflow-hidden block"
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full gradient-elegant" />
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] tracking-[0.2em] text-gold uppercase mb-2 block">{label}</span>
                    <h2 className="font-display text-lg font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground/50">
                      {formatDate(post.published_at ?? post.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
