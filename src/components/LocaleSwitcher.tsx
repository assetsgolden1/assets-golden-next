'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const FLAGS: Record<string, string> = { es: '🇪🇸', en: '🇬🇧' };
const LABELS: Record<string, string> = { es: 'Español', en: 'English' };

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Cambiar idioma"
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        <span className="text-lg leading-none" aria-hidden="true">
          {FLAGS[locale]}
        </span>
        <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[140px]">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => router.replace(pathname, { locale: loc })}
            disabled={loc === locale}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-base" aria-hidden="true">{FLAGS[loc]}</span>
            <span className="flex-1">{LABELS[loc]}</span>
            {loc === locale && (
              <span className="text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
