import type { Metadata } from 'next'
import Link from 'next/link'
import VenderForm from '@/components/forms/VenderForm'
import { buttonVariants } from '@/components/ui/button'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import { getTranslations , setRequestLocale } from 'next-intl/server'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'SellProperty' })
  return {
  title: t('meta_title'),
  description: t('meta_description'),
  alternates: buildAlternates('/vender-tu-piso', locale),
  openGraph: { url: locale === 'en' ? '/en/vender-tu-piso' : '/vender-tu-piso' },
}
}

export default async function VenderTuPisoPage(
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('SellProperty')
  return (
    <>
      {/* ─── HERO COMPACTO ────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-navy py-24 lg:py-32">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 50%, var(--gold) 0%, transparent 60%)',
          }}
        />
        <div className="container-luxury relative z-10 max-w-3xl">
          <p className="text-xs tracking-[0.3em] text-gold uppercase mb-5">
            {t('eyebrow')}
          </p>
          <h1 className="font-display text-4xl font-semibold text-white leading-tight md:text-5xl">
            {t('h1_lead')}{' '}
            <span className="text-gold">{t('h1_highlight')}</span>
            <br />
            {t('h1_tail')}
          </h1>
          <p className="mt-6 text-white/60 text-lg max-w-xl leading-relaxed">
            {t('hero_sub')}
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <span className="text-gold">✓</span> {t('badge_1')}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">✓</span> {t('badge_2')}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">✓</span> {t('badge_3')}
            </span>
          </div>
        </div>
      </section>

      {/* ─── FORMULARIO + LATERAL ─────────────────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Formulario */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Solicitar tasación gratuita
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                Complete el formulario y un especialista le contactará en menos de 24 horas.
              </p>
              <VenderForm />
            </div>

            {/* Columna derecha — por qué elegir AG */}
            <div className="lg:pt-14">
              <div className="h-px w-8 bg-gold mb-8" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-8">
                ¿Por qué confiar en Assets Golden?
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: t('step1_title'),
                    desc: t('step1_desc'),
                  },
                  {
                    step: '02',
                    title: t('step2_title'),
                    desc: t('step2_desc'),
                  },
                  {
                    step: '03',
                    title: t('step3_title'),
                    desc: t('step3_desc'),
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <span className="font-display text-3xl font-bold text-gold/30 shrink-0 leading-none mt-1">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRUEBA SOCIAL ────────────────────────────────────── */}
      <section className="bg-gold py-12">
        <div className="container-luxury">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '+200', label: t('stat_1') },
              { stat: '15', label: t('stat_2') },
              { stat: '24h', label: t('stat_3') },
            ].map((item) => (
              <div key={item.label}>
                <div className="font-display text-4xl font-bold text-navy">
                  {item.stat}
                </div>
                <div className="mt-1 text-xs tracking-wide text-navy/70 uppercase">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NAVEGACIÓN CONTEXTUAL ───────────────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-luxury text-center">
          <p className="text-sm text-muted-foreground mb-6">{t('not_sure')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/propiedades" className={buttonVariants({ variant: 'goldOutline' })}>
              {t('cta_properties')}
            </Link>
            <Link href="/sobre-nosotros" className={buttonVariants({ variant: 'outline' })}>
              {t('cta_team')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
