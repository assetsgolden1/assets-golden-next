export interface BlogPostZone {
  slug: string
  country?: string
  zone?: string
  city?: string
}

export const POST_ZONE_MAPPING: BlogPostZone[] = [
  // ── Español ────────────────────────────────────────────────────
  { slug: 'comprar-piso-espana-siendo-extranjero-2026', country: 'España' },
  { slug: 'nie-para-comprar-propiedad-espana-paso-a-paso', country: 'España' },
  { slug: 'costa-del-sol-vs-costa-blanca-invertir-2026', country: 'España' },
  { slug: 'golden-visa-espana-2026-residencia-comprando-propiedad', country: 'España' },
  { slug: 'comprar-villa-marbella-zonas-exclusivas-precios', country: 'España', zone: 'costa-del-sol', city: 'Marbella' },
  { slug: 'impuestos-comprar-vivienda-espana-no-residente', country: 'España' },
  { slug: 'invertir-en-tulum-analisis-2026', country: 'México', city: 'Tulum' },
  { slug: 'rentabilidad-alquiler-vacacional-costa-del-sol', country: 'España', zone: 'costa-del-sol' },
  { slug: 'comprar-propiedad-dubai-siendo-latino-guia-2026', country: 'Emiratos Árabes Unidos' },
  { slug: 'mejores-zonas-comprar-estepona-2026', country: 'España', zone: 'costa-del-sol', city: 'Estepona' },
  // ── English ────────────────────────────────────────────────────
  { slug: 'buying-property-spain-foreigner-2026', country: 'España' },
  { slug: 'spanish-golden-visa-2026', country: 'España' },
  { slug: 'costa-del-sol-vs-costa-blanca-invest-2026', country: 'España' },
  { slug: 'buy-villa-marbella-international-buyers', country: 'España', zone: 'costa-del-sol', city: 'Marbella' },
  { slug: 'spain-property-tax-non-residents', country: 'España' },
  { slug: 'brexit-impact-uk-buyers-spain-2026', country: 'España' },
  { slug: 'investing-tulum-real-estate-2026', country: 'México', city: 'Tulum' },
  { slug: 'holiday-rental-yields-costa-del-sol', country: 'España', zone: 'costa-del-sol' },
  { slug: 'buying-property-dubai-international-investors', country: 'Emiratos Árabes Unidos' },
  { slug: 'estepona-new-marbella-investment-guide', country: 'España', zone: 'costa-del-sol', city: 'Estepona' },
]
