import type { Metadata } from 'next'
import Link from 'next/link'
import VenderForm from '@/components/forms/VenderForm'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Vender Tu Piso en Barcelona — Tasación Gratuita',
  description:
    'Vende tu piso o propiedad de lujo en Barcelona con la máxima discreción y al mejor precio. Tasación gratuita y sin compromiso en menos de 24 horas.',
  alternates: {
    canonical: '/vender-tu-piso',
  },
  openGraph: {
    url: '/vender-tu-piso',
  },
}

export default function VenderTuPisoPage() {
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
            Barcelona · Mercado exclusivo
          </p>
          <h1 className="font-display text-4xl font-semibold text-white leading-tight md:text-5xl">
            El mercado de Barcelona lleva{' '}
            <span className="text-gold">-15% de stock.</span>
            <br />
            Es el mejor momento para vender.
          </h1>
          <p className="mt-6 text-white/60 text-lg max-w-xl leading-relaxed">
            Tasación gratuita y confidencial. Un especialista le contactará
            en menos de 24 horas.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <span className="text-gold">✓</span> Sin compromiso
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">✓</span> 100% confidencial
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">✓</span> Respuesta en 24h
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
                    title: 'Tasación gratuita en 24h',
                    desc: 'Análisis del mercado actual, comparables recientes y valoración confidencial sin coste.',
                  },
                  {
                    step: '02',
                    title: 'Estrategia personalizada',
                    desc: 'Diseñamos el plan de venta óptimo: timing, precio de salida y perfil de comprador.',
                  },
                  {
                    step: '03',
                    title: 'Venta con máxima discreción',
                    desc: 'Red offmarket exclusiva. Solo acceden compradores verificados y cualificados.',
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
              { stat: '+200', label: 'Propiedades vendidas' },
              { stat: '15', label: 'Países de compradores' },
              { stat: '24h', label: 'Tiempo medio de respuesta' },
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
          <p className="text-sm text-muted-foreground mb-6">¿No está seguro todavía?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/propiedades" className={buttonVariants({ variant: 'goldOutline' })}>
              Ver propiedades disponibles
            </Link>
            <Link href="/sobre-nosotros" className={buttonVariants({ variant: 'outline' })}>
              Conozca nuestro equipo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
