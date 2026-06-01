'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { submitLeadAction, type ActionState } from '@/app/[locale]/(public)/vender-tu-piso/actions'

const BARRIOS = [
  'Eixample',
  'Sarrià-Sant Gervasi',
  'Pedralbes',
  'Gràcia',
  'Diagonal Mar',
  'Zona Alta',
  'Otro',
]

const VALORES = [
  'Menos de 200.000€',
  '200.000€ - 500.000€',
  '500.000€ - 1.000.000€',
  'Más de 1.000.000€',
]

const PLAZOS = [
  'Inmediato (0-3 meses)',
  '3-6 meses',
  'Más de 6 meses',
  'Solo me informo',
]

const inputClass =
  'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors'

const selectClass =
  'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors appearance-none'

const labelClass = 'block text-xs font-medium tracking-wide text-foreground/70 mb-1.5 uppercase'

export default function VenderForm() {
  const [state, action, isPending] = useActionState<ActionState | null, FormData>(
    submitLeadAction,
    null
  )
  const [isOwner, setIsOwner] = useState<string>('')

  if (state?.success) {
    return (
      <div className="rounded-xl bg-navy/5 border border-gold/20 p-10 text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
          Gracias. Mensaje recibido.
        </h3>
        <p className="text-muted-foreground">
          Un especialista le contactará en menos de 24 horas.
        </p>
        <div className="mt-6 h-1 w-16 mx-auto rounded-full bg-gold" />
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre completo <span className="text-gold">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="María García López"
          className={inputClass}
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className={labelClass}>
          Teléfono <span className="text-gold">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+34 600 000 000"
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email <span className="text-gold">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="maria@ejemplo.com"
          className={inputClass}
        />
      </div>

      {/* ¿Es propietario? */}
      <div>
        <label htmlFor="is_owner" className={labelClass}>
          ¿Es usted el propietario legal? <span className="text-gold">*</span>
        </label>
        <div className="relative">
          <select
            id="is_owner"
            name="is_owner"
            required
            className={selectClass}
            value={isOwner}
            onChange={(e) => setIsOwner(e.target.value)}
          >
            <option value="" disabled>
              Seleccione una opción
            </option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▾
          </div>
        </div>
      </div>

      {/* Mensaje si NO es propietario */}
      {isOwner === 'false' && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 px-5 py-4">
          <p className="text-sm text-foreground/80">
            <span className="font-medium text-gold">Nota: </span>
            Este servicio es exclusivo para propietarios legales del inmueble.
          </p>
        </div>
      )}

      {/* Resto del formulario: solo si es propietario o aún no ha elegido */}
      {isOwner !== 'false' && (
        <>
          {/* Barrio */}
          <div>
            <label htmlFor="neighborhood" className={labelClass}>
              Barrio del inmueble
            </label>
            <div className="relative">
              <select id="neighborhood" name="neighborhood" className={selectClass}>
                <option value="">Seleccionar barrio</option>
                {BARRIOS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ▾
              </div>
            </div>
          </div>

          {/* Valor estimado */}
          <div>
            <label htmlFor="property_value_range" className={labelClass}>
              Valor estimado
            </label>
            <div className="relative">
              <select
                id="property_value_range"
                name="property_value_range"
                className={selectClass}
              >
                <option value="">Seleccionar rango</option>
                {VALORES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ▾
              </div>
            </div>
          </div>

          {/* Plazo estimado */}
          <div>
            <label htmlFor="sale_timeline" className={labelClass}>
              Plazo estimado de venta
            </label>
            <div className="relative">
              <select id="sale_timeline" name="sale_timeline" className={selectClass}>
                <option value="">Seleccionar plazo</option>
                {PLAZOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ▾
              </div>
            </div>
          </div>

          {/* GDPR */}
          <div className="flex items-start gap-3 pt-1">
            <input
              id="gdpr"
              name="gdpr"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-gold cursor-pointer"
            />
            <label htmlFor="gdpr" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              Acepto la{' '}
              <Link
                href="/politica-de-privacidad"
                className="text-gold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                política de privacidad
              </Link>{' '}
              y el tratamiento de mis datos para la gestión de mi solicitud.{' '}
              <span className="text-gold">*</span>
            </label>
          </div>

          {/* Error */}
          {state?.error && (
            <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-gold w-full rounded-lg px-6 py-4 text-sm font-semibold tracking-wide transition-all hover:shadow-[var(--shadow-gold)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? 'Enviando...' : 'Solicitar tasación gratuita'}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Respuesta en menos de 24 horas · Sin compromiso
          </p>
        </>
      )}
    </form>
  )
}
