import PropertyContactModal from '@/components/PropertyContactModal'
import { formatPrice } from '@/lib/utils/format'

interface Props {
  propertyId: string
  propertyTitle: string
  propertySlug: string
  price: number | null | undefined
  currency: string | null | undefined
  locale: string
  sold?: boolean | null
}

/**
 * Barra de contacto fija al pie, SOLO en móvil (`lg:hidden`).
 *
 * En móvil el bloque de contacto vive en el `<aside>`, que se apila al final de
 * la página: había que scrollear la ficha entera para encontrar el CTA (hallazgo
 * de la auditoría visual del 26/08). Esta barra deja precio y contacto siempre
 * a la vista, que es el patrón habitual en portales inmobiliarios.
 *
 * El atributo `data-mobile-cta` lo usa globals.css para subir el botón flotante
 * de WhatsApp y que no quede pisado por la barra.
 */
export default function PropertyMobileCTABar({
  propertyId,
  propertyTitle,
  propertySlug,
  price,
  currency,
  locale,
  sold,
}: Props) {
  if (sold) return null

  return (
    <div
      data-mobile-cta
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden"
    >
      <span className="font-display text-lg font-semibold text-foreground tabular-nums">
        {formatPrice(price, currency, locale)}
      </span>
      <PropertyContactModal
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        propertySlug={propertySlug}
        variant="bar"
      />
    </div>
  )
}
