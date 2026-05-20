import type { Metadata } from 'next'
import MiDemandaForm from './MiDemandaForm'

export const metadata: Metadata = {
  title: 'Mi Demanda — Personal Shopper Inmobiliario | Assets Golden',
  description:
    'Díganos qué propiedad busca y nuestro equipo encontrará activos que no están en el mercado para usted. Servicio de Personal Shopper Inmobiliario.',
  alternates: {
    canonical: '/mi-demanda',
  },
  openGraph: {
    url: '/mi-demanda',
  },
}

export default function MiDemandaPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Personal Shopper Inmobiliario</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Díganos qué propiedad busca
          </h1>
          <div className="mt-6 h-px w-12 bg-gold mx-auto" />
          <p className="mt-6 text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
            Nuestro equipo buscará activos que no están en el mercado para usted. Acceso exclusivo a propiedades offmarket.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="section-padding bg-background">
        <div className="container-luxury max-w-2xl">
          {/* Propositions */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { num: '500+', label: 'Propiedades offmarket' },
              { num: '15+', label: 'Países de búsqueda' },
              { num: '48h', label: 'Tiempo de respuesta' },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-xl border border-border p-5">
                <p className="font-display text-2xl font-semibold text-gold">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <MiDemandaForm />
        </div>
      </section>
    </>
  )
}
