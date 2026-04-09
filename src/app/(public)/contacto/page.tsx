import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto — Assets Golden',
  description:
    'Contacta con nuestro equipo de expertos en inmobiliaria de lujo internacional.',
}

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="text-4xl font-light tracking-wide text-amber-400">
          Contacto
        </h1>
        <p className="mt-6 text-slate-300">
          Formulario de contacto — próximamente
        </p>
      </div>
    </main>
  )
}
