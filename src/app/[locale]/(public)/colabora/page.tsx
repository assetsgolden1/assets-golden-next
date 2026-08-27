import type { Metadata } from 'next'
import ColaboraContent from './ColaboraContent'
import { buildAlternates } from '@/lib/utils/seoAlternates'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  return {
  title: 'Colabora con Nosotros',
  description:
    'Únete a la red de Assets Golden como profesional, agencia o promotora inmobiliaria. Expandamos juntos nuestra presencia internacional.',
  alternates: buildAlternates('/colabora', locale),
  openGraph: { url: locale === 'en' ? '/en/colabora' : '/colabora' },
}
}

export default function ColaboraPage() {
  return <ColaboraContent />
}
