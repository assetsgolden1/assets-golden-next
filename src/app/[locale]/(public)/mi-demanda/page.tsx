import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import MiDemandaForm from './MiDemandaForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('MyDemand')
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: { canonical: '/mi-demanda' },
    openGraph: { url: '/mi-demanda' },
  }
}

export default async function MiDemandaPage() {
  const t = await getTranslations('MyDemand')

  return (
    <>
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('hero_eyebrow')}</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">{t('hero_title')}</h1>
          <div className="mt-6 h-px w-12 bg-gold mx-auto" />
          <p className="mt-6 text-white/60 max-w-xl mx-auto text-sm leading-relaxed">{t('hero_subtitle')}</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury max-w-2xl">
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { num: '500+', key: 'stat_offmarket' },
              { num: '15+',  key: 'stat_countries' },
              { num: '48h',  key: 'stat_response' },
            ].map((s) => (
              <div key={s.key} className="text-center rounded-xl border border-border p-5">
                <p className="font-display text-2xl font-semibold text-gold">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1">{t(s.key as any)}</p>
              </div>
            ))}
          </div>

          <MiDemandaForm />
        </div>
      </section>
    </>
  )
}
