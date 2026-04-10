'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ExternalLink } from 'lucide-react'
import type { TeamMember } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  team: TeamMember[]
}

function MemberCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  return (
    <div
      className="group cursor-pointer shrink-0 w-[260px]"
      onClick={onClick}
    >
      <div className="card-premium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Portrait image */}
        <div className="relative h-[320px] overflow-hidden bg-muted">
          {member.photo_url ? (
            <Image
              src={member.photo_url}
              alt={member.name}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              sizes="260px"
            />
          ) : (
            <div className="flex h-full items-center justify-center gradient-navy">
              <span className="font-display text-4xl text-gold">{member.name.charAt(0)}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-primary-foreground text-xs">Ver perfil completo</p>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-gold transition-colors">
            {member.name}
          </h3>
          {member.role_es && (
            <p className="text-gold text-sm font-medium mb-0.5">{member.role_es}</p>
          )}
          {member.country && (
            <p className="text-muted-foreground text-xs">{member.country}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function BioModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
          {/* Photo */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="relative w-40 h-52 sm:w-48 sm:h-64 overflow-hidden rounded-xl bg-muted">
              {member.photo_url ? (
                <Image
                  src={member.photo_url}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                  sizes="192px"
                />
              ) : (
                <div className="flex h-full items-center justify-center gradient-navy">
                  <span className="font-display text-4xl text-gold">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-display text-2xl text-foreground mb-1">{member.name}</h3>
            {member.role_es && (
              <p className="text-gold font-medium mb-1">{member.role_es}</p>
            )}
            {member.country && (
              <p className="text-muted-foreground text-sm mb-4">{member.country}</p>
            )}

            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-6 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Ver perfil en LinkedIn
              </a>
            )}

            {member.bio_es && (
              <div className="space-y-3">
                {member.bio_es.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-muted-foreground text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {member.specialties && member.specialties.length > 0 && (
              <div className="mt-5">
                <h4 className="font-display text-base text-foreground mb-2">Especialidades</h4>
                <ul className="space-y-1">
                  {member.specialties.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-gold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomeTeamSection({ team }: Props) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  if (team.length === 0) return null

  return (
    <section className="section-padding bg-secondary">
      <div className="container-luxury">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Nuestros especialistas</p>
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">El equipo</h2>
          <div className="divider-gold mx-auto mt-4" />
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {team.slice(0, 10).map((member) => (
            <div key={member.id} className="snap-start">
              <MemberCard member={member} onClick={() => setSelectedMember(member)} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/equipo" className={buttonVariants({ variant: 'goldOutline', size: 'lg' })}>
            Conocer al equipo completo
          </Link>
        </div>
      </div>

      {selectedMember && (
        <BioModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </section>
  )
}
