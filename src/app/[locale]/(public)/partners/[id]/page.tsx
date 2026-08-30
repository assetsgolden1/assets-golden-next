import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import TeamMemberProfile from '@/components/team/TeamMemberProfile'
import { getPartnerById, getPartners, getRelatedPartners } from '@/lib/supabase/queries'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export async function generateStaticParams() {
  const { data } = await getPartners()
  return data.map((p) => ({ id: p.id }))
}

export const dynamicParams = true
export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const { data } = await getPartnerById(id)
  if (!data) return { title: 'Partner — Assets Golden' }
  const en = locale === 'en'
  const bio = (en ? data.bio_en ?? data.bio_es : data.bio_es) ?? ''
  return {
    title: `${data.name} | Partners`,
    description:
      bio.slice(0, 160) ||
      `Partner de Assets Golden International en ${data.country ?? 'el mercado inmobiliario internacional'}.`,
    alternates: { canonical: `/partners/${id}` },
    openGraph: { url: `/partners/${id}` },
  }
}

export default async function PartnerDetailPage({ params }: Props) {
  const { id, locale } = await params
  setRequestLocale(locale)

  const { data: partner } = await getPartnerById(id)
  if (!partner) notFound()

  const { data: related } = await getRelatedPartners(id, partner.country, 3)

  return <TeamMemberProfile member={partner} related={related} locale={locale} />
}
