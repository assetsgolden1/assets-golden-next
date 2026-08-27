'use client'
import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { EXPERTOS_GESTION } from '@/lib/constants/externalPortals'

/**
 * Acceso directo al portal de Expertos de Gestión.
 *
 * El Nº de experto se muestra con un botón de copiar porque ese login no permite
 * prellenarlo por URL (ver la nota en `lib/constants/externalPortals.ts`).
 */
export function ExpertosGestionCard() {
  const [copied, setCopied] = useState(false)

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(EXPERTOS_GESTION.expertNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Si el navegador bloquea el portapapeles, el número igual está a la vista.
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg text-primary">{EXPERTOS_GESTION.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{EXPERTOS_GESTION.description}</p>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Nº de experto</span>
            <span className="font-mono text-sm font-semibold text-primary">{EXPERTOS_GESTION.expertNumber}</span>
            <button
              type="button"
              onClick={copyNumber}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-gold"
              aria-label="Copiar el número de experto"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <a
          href={EXPERTOS_GESTION.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
        >
          Abrir CRM
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Se abre en una pestaña nueva. Necesitás tu usuario y contraseña de Expertos de Gestión;
        el Nº de experto es el mismo para todo el equipo.
      </p>
    </div>
  )
}
