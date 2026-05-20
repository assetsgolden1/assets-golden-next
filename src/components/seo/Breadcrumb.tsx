import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  name: string
  /** Ruta absoluta dentro del sitio, p.ej. "/propiedades" */
  url: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** 'default': nav simple (propiedades/blog)
   *  'secondary': sección con fondo secundario (destinos) */
  variant?: 'default' | 'secondary'
}

const BASE_URL = 'https://assetsgolden.com'

export default function Breadcrumb({ items, variant = 'default' }: BreadcrumbProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  }

  const crumbs = (
    <div
      className={
        variant === 'secondary'
          ? 'container-luxury py-3 flex items-center gap-2 text-xs text-muted-foreground'
          : 'flex items-center gap-2 text-sm text-muted-foreground'
      }
    >
      {items.map((item, index) => (
        <span key={`${item.url}-${index}`} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
          {index === items.length - 1 ? (
            <span className="text-foreground font-medium line-clamp-1">{item.name}</span>
          ) : (
            <Link href={item.url} className="hover:text-gold transition-colors">
              {item.name}
            </Link>
          )}
        </span>
      ))}
    </div>
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {variant === 'secondary' ? (
        <section className="bg-secondary border-b border-border">{crumbs}</section>
      ) : (
        <nav aria-label="breadcrumb" className="container-luxury py-4">
          {crumbs}
        </nav>
      )}
    </>
  )
}
