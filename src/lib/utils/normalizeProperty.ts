import { normalizeLocation } from './normalizeLocation'

function toTitleCase(s: string | null | undefined): string | null {
  if (!s) return null
  const trimmed = s.trim()
  if (!trimmed) return null
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function normalizePropertyFields(input: {
  country?: string | null
  province?: string | null
  location?: string | null
  [key: string]: unknown
}) {
  return {
    ...input,
    country: input.country?.trim() || null,
    province: toTitleCase(input.province),
    location: input.location?.trim() ? normalizeLocation(input.location.trim()) : null,
  }
}
