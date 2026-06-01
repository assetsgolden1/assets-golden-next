'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const FLAGS: Record<string, string> = { es: '🇪🇸', en: '🇬🇧' }
const LABELS: Record<string, string> = { es: 'Español', en: 'English' }

export default function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 p-0.5">
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          aria-label={LABELS[loc]}
          title={LABELS[loc]}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full text-base leading-none transition-all duration-150',
            locale === loc
              ? 'bg-gold/30 scale-110 opacity-100'
              : 'opacity-50 hover:opacity-90 hover:scale-105'
          )}
        >
          <span aria-hidden="true">{FLAGS[loc]}</span>
        </Link>
      ))}
    </div>
  )
}
