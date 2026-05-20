import type { Metadata } from 'next'
import ColaboraContent from './ColaboraContent'

export const metadata: Metadata = {
  title: 'Colabora con Nosotros | Assets Golden',
  description:
    'Únete a la red de Assets Golden como profesional, agencia o promotora inmobiliaria. Expandamos juntos nuestra presencia internacional.',
  alternates: {
    canonical: '/colabora',
  },
}

export default function ColaboraPage() {
  return <ColaboraContent />
}
