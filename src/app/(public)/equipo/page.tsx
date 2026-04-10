import type { Metadata } from 'next'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { getTeamMembers } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Equipo | Assets Golden',
  description:
    'Conoce a los especialistas en inmobiliaria de lujo de Assets Golden. Expertos en Barcelona y mercados internacionales.',
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
            del mercado de lujo en Barcelona y 15 países.
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
              {member.photo_url ? (
                <Image
                  src={member.photo_url}
                  alt={member.name}
                  fill
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
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
