'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Briefcase, Building2, HardHat } from 'lucide-react'
import CollaborateDialog from '@/components/CollaborateDialog'

type CollabType = 'profesional' | 'agencia' | 'promotora'

const TYPE_IDS = [
  { id: 'profesional' as CollabType, Icon: Briefcase, key: 'pro' },
  { id: 'agencia' as CollabType, Icon: Building2, key: 'agency' },
  { id: 'promotora' as CollabType, Icon: HardHat, key: 'dev' },
]

export default function ColaboraContent() {
  const tr = useTranslations('Collaborate')
  const TYPES = TYPE_IDS.map(({ id, Icon, key }) => ({
    id,
    Icon,
    title: tr(`type_${key}`),
    description: tr(`type_${key}_desc`),
    cta: tr(`type_${key}_cta`),
  }))
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
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{tr('eyebrow')}</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            {tr('h1')}
          </h1>
          <div className="mt-6 h-px w-12 bg-gold mx-auto" />
          <p className="mt-6 text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
            {tr('intro')}
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
            <h2 className="font-display text-2xl font-semibold mb-4">{tr('why_title')}</h2>
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
