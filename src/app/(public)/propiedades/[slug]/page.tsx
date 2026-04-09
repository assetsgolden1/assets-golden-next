import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('title, description, image_url')
    .eq('id', slug)
    .single()

  if (!property) {
    return { title: 'Propiedad no encontrada — Assets Golden' }
  }

  return {
    title: `${property.title} — Assets Golden`,
    description: property.description ?? undefined,
    openGraph: {
      images: property.image_url ? [property.image_url] : [],
    },
  }
}

export const revalidate = 3600 // ISR: revalidar cada hora

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', slug)
    .single()

  if (!property) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="text-4xl font-light tracking-wide text-amber-400">
          {property.title}
        </h1>
        <p className="mt-4 text-slate-300">{property.location}</p>
        {property.price && (
          <p className="mt-2 text-2xl font-light text-white">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: property.currency ?? 'EUR',
              maximumFractionDigits: 0,
            }).format(property.price)}
          </p>
        )}
      </div>
    </main>
  )
}
