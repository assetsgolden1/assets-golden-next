import Image from 'next/image'
import { MapPin, ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { getLinkedin } from '@/lib/constants/linkedinMap'
import { optimizedImage } from '@/lib/utils/optimizedImage'
import type { TeamMember } from '@/types'

/** Ruta canónica del perfil según el tipo: los partners viven bajo /partners. */
export function memberProfileHref(member: Pick<TeamMember, 'id' | 'member_type'>): string {
  return member.member_type === 'partner' ? `/partners/${member.id}` : `/equipo/${member.id}`
}

interface Props {
  member: TeamMember
  related: TeamMember[]
  locale: string
}

/**
 * Ficha de una persona del equipo. La usan tanto /equipo/[id] (fundadores y
 * equipo) como /partners/[id], para que exista un solo diseño y para que la
 * página respete el idioma: la versión anterior mostraba siempre `bio_es` y
 * textos fijos en español, también en /en.
 */
export default async function TeamMemberProfile({ member, related, locale }: Props) {
  const t = await getTranslations('MemberProfile')
  const en = locale === 'en'
  const isPartner = member.member_type === 'partner'

  const role = (en ? member.role_en ?? member.role_es : member.role_es) ?? ''
  const bio = (en ? member.bio_en ?? member.bio_es : member.bio_es) ?? ''
  const specialties = (member.specialties ?? []) as string[]
  const linkedin = getLinkedin(member.name) || member.linkedin_url
  const photo = member.photo_url

  const relatedTitle = isPartner
    ? t('related_partners')
    : member.member_type === 'founder'
      ? t('related_founders')
      : t('related_team')

  return (
    <>
      <section className="gradient-navy py-16">
        <div className="container-luxury">
          <Link
            href={isPartner ? '/partners' : '/equipo'}
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {isPartner ? t('back_partners') : t('back_team')}
          </Link>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {photo && (
              <div className="relative h-48 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-gold/30">
                <Image
                  src={optimizedImage(photo, { width: 400, quality: 75 })}
                  alt={member.name}
                  fill
                  unoptimized
                  className="object-cover object-top"
                  sizes="144px"
                />
              </div>
            )}
            <div>
              {role && (
                <span className="mb-3 inline-block rounded-full bg-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                  {role}
                </span>
              )}
              <h1 className="font-display text-3xl font-semibold text-white md:text-4xl">{member.name}</h1>
              {member.country && (
                <div className="mt-2 flex items-center gap-1.5 text-white/50 text-sm">
                  <MapPin className="h-4 w-4 text-gold" />
                  {member.country}
                </div>
              )}
              {linkedin && (
                <div className="mt-4 flex gap-3">
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury max-w-2xl">
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold mb-4">{t('profile')}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {bio || t('no_bio')}
            </p>
          </div>

          {specialties.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold mb-4">{t('specialties')}</h2>
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

          {related.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-xl font-semibold mb-4">{relatedTitle}</h2>
              <div className="space-y-3">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={memberProfileHref(p)}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.country && <span className="text-xs text-muted-foreground">{p.country}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold mb-4">
              {t('contact_title', { name: member.name })}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{t('contact_text')}</p>
            <Link
              href={`/contacto?persona=${encodeURIComponent(member.name)}`}
              className={buttonVariants({ variant: 'gold' })}
            >
              {t('contact_cta')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
