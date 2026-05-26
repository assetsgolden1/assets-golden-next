'use client'

/**
 * CookieConsentInit
 *
 * Initializes vanilla-cookieconsent v3 on mount.
 * - Shows a GDPR-compliant banner on first visit (ES language)
 * - 3 categories: necessary (always on), analytics, marketing
 * - Loads Meta Pixel dynamically ONLY after marketing consent
 * - Persists choice in `cc_cookie` (SameSite=Lax, Secure)
 * - Equal-weight Accept/Reject buttons (RGPD requirement)
 */

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

/**
 * Dynamically injects and initializes the Meta Pixel SDK.
 * Safe to call multiple times — exits early if fbq already exists.
 * window.fbq? is declared in src/lib/meta/track.ts.
 */
function initMetaPixel(pixelId: string): void {
  if (typeof window === 'undefined') return
  if (window.fbq) return // already initialized (idempotent guard)

  const el = document.createElement('script')
  el.id = 'meta-pixel-init'
  el.textContent = [
    '!function(f,b,e,v,n,t,s)',
    '{if(f.fbq)return;n=f.fbq=function(){n.callMethod?',
    'n.callMethod.apply(n,arguments):n.queue.push(arguments)};',
    "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';",
    'n.queue=[];t=b.createElement(e);t.async=!0;',
    't.src=v;s=b.getElementsByTagName(e)[0];',
    "s.parentNode.insertBefore(t,s)}(window, document,'script',",
    "'https://connect.facebook.net/en_US/fbevents.js');",
    `fbq('init', '${pixelId}');`,
    `fbq('track', 'PageView');`,
  ].join('')
  document.head.appendChild(el)
}

export default function CookieConsentInit() {
  useEffect(() => {
    void CookieConsent.run({
      // ── UI layout ────────────────────────────────────────────────
      guiOptions: {
        consentModal: {
          layout: 'box',
          position: 'bottom left',
          equalWeightButtons: true, // RGPD: mismo peso visual para Aceptar y Rechazar
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },

      // ── Categories ───────────────────────────────────────────────
      categories: {
        necessary: {
          enabled: true,
          readOnly: true, // no toggle — always on
        },
        analytics: {
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: '_gid' }],
          },
        },
        marketing: {
          autoClear: {
            cookies: [{ name: /^_fbp/ }, { name: '_fbc' }],
          },
        },
      },

      // ── Callbacks ─────────────────────────────────────────────────
      onConsent: ({ cookie }) => {
        // Fires every page load when consent cookie exists.
        if (PIXEL_ID && cookie.categories.includes('marketing')) {
          initMetaPixel(PIXEL_ID)
        }
      },
      onChange: ({ cookie, changedCategories }) => {
        // Fires when preferences change after initial consent.
        if (
          PIXEL_ID &&
          changedCategories.includes('marketing') &&
          cookie.categories.includes('marketing')
        ) {
          initMetaPixel(PIXEL_ID)
        }
      },

      // ── Language / texts ──────────────────────────────────────────
      language: {
        default: 'es',
        translations: {
          es: {
            consentModal: {
              title: 'Usamos cookies',
              description:
                'Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico del sitio y mostrarte publicidad personalizada en redes sociales y plataformas externas (Meta Pixel). Puedes aceptar todas, rechazarlas o personalizar tu elección.',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar',
              showPreferencesBtn: 'Personalizar',
              footer:
                '<a href="/politica-de-cookies" class="cc__link">Política de cookies</a> · <a href="/politica-de-privacidad" class="cc__link">Privacidad</a>',
            },
            preferencesModal: {
              title: 'Centro de preferencias de cookies',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar todas',
              savePreferencesBtn: 'Guardar preferencias',
              closeIconLabel: 'Cerrar',
              serviceCounterLabel: 'Servicio|Servicios',
              sections: [
                {
                  title: 'Uso de cookies',
                  description:
                    'Usamos cookies para garantizar el funcionamiento básico del sitio, analizar el tráfico de forma anónima y, con tu consentimiento, medir la efectividad de nuestras campañas publicitarias. Puedes gestionar tus preferencias en cualquier momento.',
                },
                {
                  title: 'Cookies estrictamente necesarias',
                  description:
                    'Imprescindibles para el funcionamiento del sitio (sesión, seguridad, preferencias de idioma). No pueden desactivarse.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Cookies analíticas',
                  description:
                    'Nos ayudan a entender cómo los visitantes interactúan con el sitio web (páginas más vistas, tiempo de sesión). Los datos son anónimos y agregados. Actualmente: Google Analytics 4.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'Cookies de marketing',
                  description:
                    'Se utilizan para rastrear visitas entre sitios web y medir la efectividad de campañas publicitarias. Permiten mostrar publicidad relevante en plataformas externas como Meta (Facebook/Instagram). Actualmente: Meta Pixel.',
                  linkedCategory: 'marketing',
                },
                {
                  title: 'Más información',
                  description:
                    'Consulta nuestra <a class="cc__link" href="/politica-de-cookies">Política de Cookies</a> o ejerce tus derechos en <a class="cc__link" href="/politica-de-privacidad">Política de Privacidad</a>. Para revocar el consentimiento en cualquier momento, haz clic en «Configurar cookies» en el pie de página.',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
