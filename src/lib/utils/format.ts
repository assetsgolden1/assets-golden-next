export function formatPrice(
  price: number | null | undefined,
  currency: string | null | undefined = 'EUR',
  locale = 'es'
): string {
  if (price === null || price === undefined) {
    return locale === 'en' ? 'Price on request' : 'Precio a consultar'
  }
  const intlLocale = locale === 'en' ? 'en-GB' : 'es-ES'
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatNumber(num: number, locale = 'es'): string {
  const intlLocale = locale === 'en' ? 'en-GB' : 'es-ES'
  return new Intl.NumberFormat(intlLocale).format(num)
}

export function formatDate(date: string | Date | null, locale = 'es'): string {
  if (!date) return ''
  const intlLocale = locale === 'en' ? 'en-GB' : 'es-ES'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
