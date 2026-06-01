'use client'

import { useState } from 'react'
import { Briefcase, Building2, HardHat } from 'lucide-react'
import CollaborateDialog from '@/components/CollaborateDialog'

type CollabType = 'profesional' | 'agencia' | 'promotora'

const TYPES = [
  {
    id: 'profesional' as CollabType,
    Icon: Briefcase,
    title: 'Profesional',
    description: 'Agentes inmobiliarios, asesores, arquitectos y otros profesionales del sector',
    cta: 'Unirme como profesional',
  },
  {
    id: 'agencia' as CollabType,
    Icon: Building2,
    title: 'Agencia',
    description: 'Agencias inmobiliarias que buscan expandir su red de colaboración',
    cta: 'Unirme como agencia',
  },
  {
    id: 'promotora' as CollabType,
    Icon: HardHat,
    title: 'Promotora',
    description: 'Promotoras y desarrolladoras inmobiliarias con proyectos activos',
    cta: 'Unirme como promotora',
  },
]

export default function ColaboraContent() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<CollabType | null>(null)

  const openWith = (type: CollabType) => {
    setSelectedType(type)
    setDialogOpen(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Red de colaboración</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Colabora con Nosotros
          </h1>
          <div className="mt-6 h-px w-12 bg-gold mx-auto" />
          <p className="mt-6 text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
            Seleccione el tipo de colaboración que mejor se adapte a su perfil y únase a nuestra red internacional.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TYPES.map((t) => (
              <div key={t.id} className="card-premium rounded-2xl p-8 flex flex-col text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
                  <t.Icon className="h-8 w-8 text-gold" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-3">{t.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">{t.description}</p>
                <button
                  onClick={() => openWith(t.id)}
                  className="mt-8 w-full rounded-lg bg-gold text-navy font-semibold py-2.5 text-sm hover:bg-gold/90 transition-colors"
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Why collaborate */}
          <div className="mt-20 max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl font-semibold mb-4">¿Por qué colaborar con Assets Golden?</h2>
            <div className="divider-gold mx-auto mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {[
                'Acceso a cartera offmarket exclusiva',
                'Red de compradores internacionales cualificados',
                'Comisiones competitivas y transparentes',
                'Soporte jurídico y documental',
                'Presencia en más de 15 mercados internacionales',
                'Tecnología y herramientas de captación',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="text-gold mt-0.5">✦</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CollaborateDialog
        open={dialogOpen}
        initialType={selectedType}
        onClose={() => { setDialogOpen(false); setSelectedType(null) }}
      />
    </>
  )
}
