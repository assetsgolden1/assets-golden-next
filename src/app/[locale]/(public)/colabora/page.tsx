import type { Metadata } from 'next'
import ColaboraContent from './ColaboraContent'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import { getTranslations , setRequestLocale } from 'next-intl/server'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Collaborate' })
  return {
  title: t('meta_title'),
  description: t('meta_description'),
  alternates: buildAlternates('/colabora', locale),
  openGraph: { url: locale === 'en' ? '/en/colabora' : '/colabora' },
}
}

export default function ColaboraPage() {
  return <ColaboraContent />
}
