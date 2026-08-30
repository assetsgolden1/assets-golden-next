import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import TeamMemberProfile from '@/components/team/TeamMemberProfile'
import {
  getTeamMemberById,
  getRelatedTeamMembers,
  getNonPartnerMembers,
} from '@/lib/supabase/queries'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export async function generateStaticParams() {
  const { data } = await getNonPartnerMembers()
  return data.map((m) => ({ id: m.id }))
}

export const dynamicParams = true
export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const { data } = await getTeamMemberById(id)
  if (!data) return { title: 'Assets Golden' }
  const en = locale === 'en'
  const bio = (en ? data.bio_en ?? data.bio_es : data.bio_es) ?? ''
  const role = (en ? data.role_en ?? data.role_es : data.role_es) ?? ''
  return {
    title: `${data.name}${role ? ` | ${role}` : ''}`,
    description: bio.slice(0, 160) || `${data.name} — Assets Golden International.`,
    alternates: { canonical: `/equipo/${id}` },
    openGraph: { url: `/equipo/${id}` },
  }
}

export default async function TeamMemberPage({ params }: Props) {
  const { id, locale } = await params
  setRequestLocale(locale)

  const { data: member } = await getTeamMemberById(id)
  if (!member || !member.active) notFound()

  // Un partner tiene su ficha canónica en /partners/[id]: se redirige para no
  // dejar dos URLs con el mismo contenido (contenido duplicado en SEO).
  if (member.member_type === 'partner') {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
    permanentRedirect(`${prefix}/partners/${member.id}`)
  }

  const { data: related } = await getRelatedTeamMembers(member.id, member.member_type, 3)

  return <TeamMemberProfile member={member} related={related} locale={locale} />
}
