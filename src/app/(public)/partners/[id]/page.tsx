import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import { getPartnerById, getPartners } from '@/lib/supabase/queries'
import { buttonVariants } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const { data } = await getPartners()
  return data.map((p) => ({ id: p.id }))
}

export const dynamicParams = true
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data } = await getPartnerById(id)
  if (!data) return { title: 'Partner — Assets Golden' }
  return {
    title: `${data.name} | Partners — Assets Golden`,
    description: data.bio_es?.slice(0, 160) ?? `Partner de Assets Golden International en ${data.country ?? 'el mercado inmobiliario internacional'}.`,
  }
}

export default async function PartnerDetailPage({ params }: Props) {
  const { id } = await params
  const { data: partner } = await getPartnerById(id)

  if (!partner) notFound()

  const specialties = (partner.specialties ?? []) as string[]

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-16">
        <div className="container-luxury">
          <Link
            href="/partners"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a partners
          </Link>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {partner.photo_url && (
              <div className="shrink-0">
                <img
                  src={partner.photo_url}
                  alt={partner.name}
                  className="h-48 w-36 rounded-xl border-2 border-gold/30 object-cover object-top"
                />
              </div>
            )}
            <div>
              {partner.role_es && (
                <span className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                  {partner.role_es}
                </span>
              )}
              <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">{partner.name}</h1>
              {partner.country && (
                <div className="mt-2 flex items-center gap-1.5 text-white/50 text-sm">
                  <MapPin className="h-4 w-4 text-gold" />
                  {partner.country}
                </div>
              )}
              <div className="mt-4 flex gap-3">
                {partner.linkedin_url && (
                  <a
                    href={partner.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="section-padding bg-background">
        <div className="container-luxury max-w-2xl">
          {partner.bio_es && (
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold mb-4">Perfil profesional</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{partner.bio_es}</p>
            </div>
          )}

          {specialties.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold mb-4">Especialidades</h2>
              <div className="flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold mb-4">¿Quiere contactar con {partner.name}?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Puede contactarnos directamente y pondremos en contacto con nuestro partner en {partner.country ?? 'su región'}.
            </p>
            <Link
              href={`/contacto?partner=${encodeURIComponent(partner.name)}`}
              className={buttonVariants({ variant: 'gold' })}
            >
              Solicitar contacto
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
