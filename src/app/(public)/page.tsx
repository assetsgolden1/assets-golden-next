import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assets Golden — Inmobiliaria de Lujo Internacional',
  description:
    'Propiedades exclusivas en los mejores destinos del mundo. Compra, vende e invierte con expertos en inmobiliaria de lujo internacional.',
}

export default function HomePage() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <h1 className="text-5xl font-light tracking-widest text-amber-400">
          ASSETS GOLDEN
        </h1>
        <p className="mt-4 text-sm tracking-widest text-amber-400/70 uppercase">
          International Real Estate Consulting
        </p>
      </section>
    </main>
  )
}
