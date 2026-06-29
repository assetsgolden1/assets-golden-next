import type { Metadata } from 'next'
import Image from 'next/image'
import { getTeamMembers } from '@/lib/supabase/queries'
import { getLinkedin } from '@/lib/constants/linkedinMap'
import { getLocalPhoto } from '@/lib/constants/photoMap'
import { optimizedImage } from '@/lib/utils/optimizedImage'

export const metadata: Metadata = {
  title: 'Equipo',
  description:
    'Profesionales especializados en propiedades exclusivas con trayectoria internacional. Conozca al equipo de expertos en Barcelona y en los principales destinos del mundo.',
  alternates: {
    canonical: '/equipo',
  },
  openGraph: {
    url: '/equipo',
  },
}

export const revalidate = 86400

const memberTypeLabel: Record<string, string> = {
  founder: 'Fundador',
  partner: 'Socio',
  team: 'Equipo',
}

export default async function EquipoPage() {
  const { data: team } = await getTeamMembers()

  const founders = team.filter((m) => m.member_type === 'founder')
  const partners = team.filter((m) => m.member_type === 'partner')
  const members = team.filter((m) => m.member_type === 'team')

  return (
    <>
      {/* Header */}
      <section className="gradient-navy py-24">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">
            Especialistas
          </p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Nuestro equipo
          </h1>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-white/60 max-w-lg mx-auto">
            Profesionales con trayectoria internacional y profundo conocimiento
            del mercado exclusivo en Barcelona y 12 países.
          </p>
        </div>
      </section>

      {/* Equipo */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          {team.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Equipo disponible próximamente.
            </p>
          ) : (
            <div className="space-y-20">
              {/* Fundadores */}
              {founders.length > 0 && (
                <TeamGroup title="Fundadores" members={founders} />
              )}
              {/* Partners */}
              {partners.length > 0 && (
                <TeamGroup title="Partners" members={partners} />
              )}
              {/* Equipo */}
              {members.length > 0 && (
                <TeamGroup title="Equipo" members={members} />
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function TeamGroup({
  title,
  members,
}: {
  title: string
  members: Awaited<ReturnType<typeof getTeamMembers>>['data']
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-10">
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {members.map((member) => (
          <div key={member.id} className="group">
            {/* Foto */}
            <div className="relative mb-5 aspect-[3/4] overflow-hidden rounded-xl bg-muted">
              {(member.photo_url || getLocalPhoto(member.name)) ? (
                <Image
                  src={optimizedImage(member.photo_url || getLocalPhoto(member.name)!, { width: 400, quality: 70 })}
                  alt={member.name}
                  fill
                  unoptimized
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center gradient-navy">
                  <span className="font-display text-5xl text-gold/40">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
              {/* Overlay con tipo */}
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-gold/90 px-2.5 py-0.5 text-[10px] font-semibold text-navy uppercase tracking-wide">
                  {memberTypeLabel[member.member_type] ?? member.member_type}
                </span>
              </div>
            </div>

            {/* Info */}
            <h3 className="font-display text-base font-semibold text-foreground group-hover:text-gold transition-colors">
              {member.name}
            </h3>
            {member.role_es && (
              <p className="mt-0.5 text-sm text-muted-foreground">{member.role_es}</p>
            )}
            {member.country && (
              <p className="mt-0.5 text-xs text-muted-foreground/60">{member.country}</p>
            )}

            {/* Bio */}
            {member.bio_es && (
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-4">
                {member.bio_es}
              </p>
            )}

            {/* LinkedIn */}
            {(getLinkedin(member.name) || member.linkedin_url) && (
              <a
                href={(getLinkedin(member.name) || member.linkedin_url)!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
