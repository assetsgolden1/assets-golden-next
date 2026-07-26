import { revalidatePath } from 'next/cache'
import { routing } from '@/i18n/routing'

// Rutas públicas afectadas al crear/editar/borrar una propiedad.
const PUBLIC_PATHS = ['', '/propiedades', '/destinos', '/destinos/espana']

/**
 * Invalida la caché ISR de las rutas públicas afectadas por un cambio de
 * propiedades. Las páginas públicas viven bajo `/[locale]/(public)/...`, así que
 * se prerenderizan como `/es/destinos`, `/en/destinos`, etc. Revalidar solo
 * `/destinos` NO matchea esas entradas de caché: hay que hacerlo por locale
 * (además del path sin prefijo, que es el que sirve el defaultLocale).
 */
export function revalidatePropertyPaths() {
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path === '' ? '/' : path)
    for (const locale of routing.locales) {
      revalidatePath(`/${locale}${path}`)
    }
  }
}
