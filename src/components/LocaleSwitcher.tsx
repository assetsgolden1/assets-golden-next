'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <div className="flex items-center border border-primary-foreground/20 rounded overflow-hidden">
      <button
        onClick={() => switchLocale('es')}
        disabled={isPending || locale === 'es'}
        aria-label="Español"
        title="Español"
        className={cn(
          'flex items-center justify-center px-2 py-1 text-sm leading-none transition-colors',
          locale === 'es'
            ? 'bg-gold/20 opacity-100'
            : 'opacity-50 hover:opacity-80'
        )}
      >
        🇪🇸
      </button>
      <div className="w-px h-4 bg-primary-foreground/20 shrink-0" />
      <button
        onClick={() => switchLocale('en')}
        disabled={isPending || locale === 'en'}
        aria-label="English"
        title="English"
        className={cn(
          'flex items-center justify-center px-2 py-1 text-sm leading-none transition-colors',
          locale === 'en'
            ? 'bg-gold/20 opacity-100'
            : 'opacity-50 hover:opacity-80'
        )}
      >
        🇬🇧
      </button>
    </div>
  )
}
