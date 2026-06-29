import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import GlobalSchemaOrg from '@/components/seo/GlobalSchemaOrg'
import HtmlLangSync from '@/components/HtmlLangSync'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'es' | 'en')) notFound()
  // Habilita el render estático: a partir de acá getTranslations/getLocale/
  // getMessages NO leen el request (no fuerzan dinámico).
  setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <GlobalSchemaOrg locale={locale} />
      <HtmlLangSync locale={locale} />
      {children}
    </NextIntlClientProvider>
  )
}
