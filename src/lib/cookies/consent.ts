/**
 * Cookie consent helpers.
 *
 * vanilla-cookieconsent stores its state in the `cc_cookie` cookie as JSON.
 * These helpers are safe to call on both server (returns false) and client.
 */

export type ConsentCategory = 'analytics' | 'marketing'

/**
 * Returns true if the user has accepted the given consent category.
 * Reads the `cc_cookie` cookie set by vanilla-cookieconsent v3.
 */
export function hasConsent(category: ConsentCategory): boolean {
  if (typeof document === 'undefined') return false
  try {
    const raw = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cc_cookie='))
    if (!raw) return false
    const value = JSON.parse(
      decodeURIComponent(raw.split('=').slice(1).join('='))
    ) as { categories?: string[] }
    return Array.isArray(value?.categories) && value.categories.includes(category)
  } catch {
    return false
  }
}
