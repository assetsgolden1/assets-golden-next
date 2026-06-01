'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-1.5 text-sm font-medium"
      aria-label="Cambiar idioma"
    >
      {routing.locales.map((loc, idx) => (
        <span key={loc} className="flex items-center gap-1.5">
          <Link
            href={pathname}
            locale={loc}
            aria-label={loc === 'es' ? 'Español' : 'English'}
            className={
              loc === locale
                ? 'text-gold font-semibold cursor-default'
                : 'text-white/50 hover:text-white transition-colors'
            }
            aria-current={loc === locale ? 'true' : undefined}
          >
            {loc.toUpperCase()}
          </Link>
          {idx === 0 && (
            <span className="text-white/30" aria-hidden>|</span>
          )}
        </span>
      ))}
    </div>
  );
}
