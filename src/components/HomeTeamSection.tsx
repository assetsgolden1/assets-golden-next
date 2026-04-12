'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import type { TeamMember } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { getLinkedin } from '@/lib/constants/linkedinMap'

// Icono LinkedIn SVG inline (Lucide no incluye Linkedin)
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function getMemberLinkedin(member: TeamMember): string | undefined {
  return getLinkedin(member.name) || member.linkedin_url || undefined
}

interface Props {
  team: TeamMember[]
}

function MemberCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  const linkedinUrl = getMemberLinkedin(member)

  return (
    <div
      className="group cursor-pointer shrink-0 w-[260px]"
      onClick={onClick}
    >
      <div className="card-premium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Portrait image */}
        <div className="relative h-[320px] overflow-hidden bg-muted flex-shrink-0">
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

        {/* Info — altura fija para uniformidad */}
        <div className="p-5 overflow-hidden">
          <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-gold transition-colors line-clamp-1">
            {member.name}
          </h3>
          {member.role_es && (
            <p className="text-gold text-sm font-medium mb-0.5 line-clamp-1">{member.role_es}</p>
          )}
          {member.country && (
            <p className="text-muted-foreground text-xs line-clamp-1">{member.country}</p>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1 text-[10px] text-gold/70 hover:text-gold transition-colors"
              aria-label={`LinkedIn de ${member.name}`}
            >
              <LinkedinIcon className="h-3 w-3" />
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function BioModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const linkedinUrl = getMemberLinkedin(member)

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

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-6 text-sm"
              >
                <LinkedinIcon className="h-4 w-4" />
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
