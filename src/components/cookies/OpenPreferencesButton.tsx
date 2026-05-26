'use client'

/**
 * OpenPreferencesButton
 *
 * Renders a button/link in the footer that opens the
 * vanilla-cookieconsent preferences modal.
 * Must be used inside a layout that includes <CookieConsentInit />.
 */

import * as CookieConsent from 'vanilla-cookieconsent'

export default function OpenPreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => CookieConsent.showPreferences()}
      className="hover:text-gold transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-primary-foreground/40"
    >
      Configurar cookies
    </button>
  )
}
