import { setRequestLocale } from 'next-intl/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import AttributionCapture from '@/components/analytics/AttributionCapture'

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Header/Footer son async y usan getTranslations → setRequestLocale acá para
  // que no fuercen render dinámico en todo el subárbol público.
  setRequestLocale(locale)
  return (
    <>
      <AttributionCapture />
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
