import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-navy flex flex-col items-center justify-center text-center px-4">
      <Image
        src="/logo.png"
        alt="Assets Golden"
        width={160}
        height={50}
        className="mb-8 opacity-90"
      />
      <p className="text-gold text-xs tracking-[0.25em] uppercase mb-4">Error 404</p>
      <h1 className="font-display text-4xl font-semibold text-white mb-4">
        Página no encontrada
      </h1>
      <p className="text-white/60 text-base max-w-md mb-8 leading-relaxed">
        Lo sentimos, la página que busca no existe o ha sido movida.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="btn-gold rounded-lg px-6 py-3 text-sm font-semibold"
        >
          Volver al inicio
        </Link>
        <Link
          href="/propiedades"
          className="rounded-lg border border-gold/50 text-gold px-6 py-3 text-sm font-semibold hover:bg-gold/10 transition-colors"
        >
          Ver propiedades
        </Link>
      </div>
    </div>
  )
}
