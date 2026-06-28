// Resuelve la lista de form_ids de Meta a sincronizar.
//
// Cascada de fallback (para no romper ningún deploy):
//   1. META_LEADS_FORM_IDS  → lista CSV ("id1,id2"). Soporta espacios y comas colgadas.
//   2. META_LEADS_FORM_ID    → un solo form (config legacy single-form).
//   3. LEGACY_FORM_ID        → hardcoded del form viejo, último recurso.
const LEGACY_FORM_ID = '1495878108643736'

export function getFormIds(): string[] {
  const csv = process.env.META_LEADS_FORM_IDS
  if (csv) {
    const ids = csv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (ids.length > 0) return ids
  }

  const single = process.env.META_LEADS_FORM_ID?.trim()
  if (single) return [single]

  return [LEGACY_FORM_ID]
}
