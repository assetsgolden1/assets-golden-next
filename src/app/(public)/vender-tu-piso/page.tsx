import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vender Tu Propiedad — Assets Golden',
  description:
    'Vende tu propiedad con Assets Golden. Expertos en inmobiliaria de lujo con red internacional de compradores cualificados.',
}

export default function VenderTuPisoPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-light tracking-wide text-amber-400">
          Vende tu propiedad
        </h1>
        <p className="mt-6 text-slate-300">
          Formulario de captación — próximamente
        </p>
      </div>
    </main>
  )
}
