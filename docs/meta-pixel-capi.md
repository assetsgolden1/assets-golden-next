# Meta Pixel + Conversions API (CAPI)

Pixel ID: `1009529298161262`

## Variables de entorno requeridas

```
NEXT_PUBLIC_META_PIXEL_ID=1009529298161262
META_CAPI_ACCESS_TOKEN=<token del Events Manager>
META_CAPI_TEST_EVENT_CODE=<opcional, para test events en desarrollo>
```

Configurar tanto en `.env.local` (local) como en Vercel → Settings → Environment Variables (production).

---

## Arquitectura

```
Browser                              Servidor Next.js
  │                                        │
  ├── fbq('track', 'Lead', {}, {eventID})  │
  │   (via window.fbq — client-side)       │
  │                                        │
  └── POST /api/meta/conversion ──────────►│
      { eventName, eventId, userData }     │
                                           ├── sendCapiEvent()
                                           │   SHA-256 hash de PII
                                           └── POST graph.facebook.com/v18.0
```

Ambos lados comparten el mismo `eventID` → Meta deduplica automáticamente.

---

## Eventos implementados

### PageView
- **Dónde:** `src/components/analytics/MetaPixel.tsx`
- **Cuándo:** En cada navegación (carga inicial + SPA navigation)
- **Solo client-side** — suficiente para PageView

### Lead
- **Dónde:** Formulario `/contacto` → `ContactForm.tsx` | Formulario `/mi-demanda` → `MiDemandaForm.tsx` | Modal de propiedad → `PropertyContactModal.tsx`
- **Cuándo:** Al enviar el formulario con éxito
- **Deduplicación:** `eventID = crypto.randomUUID()` compartido en client y server
- **PII enviada al CAPI:** email hasheado, teléfono hasheado, nombre/apellido hasheados

### Contact
- **Dónde:** `src/components/WhatsAppButton.tsx`
- **Cuándo:** Al hacer click en el botón flotante de WhatsApp
- **Solo client-side + CAPI sin PII** (el usuario no envió datos todavía)

### ViewContent
- **Dónde:** `src/components/analytics/ViewContentTracker.tsx` → incluido en `/propiedades/[slug]/page.tsx`
- **Cuándo:** Al montar la página de propiedad individual
- **Parámetros:** `content_ids` (ref_code o id), `content_name` (título), `value` (precio), `currency`
- **Deduplicación:** `eventID = crypto.randomUUID()` compartido en client y server

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `src/components/analytics/MetaPixel.tsx` | Script fbq + PageView automático |
| `src/components/analytics/ViewContentTracker.tsx` | Evento ViewContent en páginas de propiedad |
| `src/lib/meta/track.ts` | Helpers client-side: `fbqTrack()` y `sendServerEvent()` |
| `src/lib/meta/capi.ts` | Función `sendCapiEvent()` con SHA-256 |
| `src/lib/meta/cookies.ts` | Extrae `_fbp` y `_fbc` del request |
| `src/app/api/meta/conversion/route.ts` | Endpoint POST que recibe eventos del browser y los reenvía al CAPI |

---

## Cómo agregar un nuevo evento

**1. Client-side** (en cualquier componente `'use client'`):
```ts
import { fbqTrack, sendServerEvent } from '@/lib/meta/track'

const eventId = crypto.randomUUID()
fbqTrack('Purchase', { value: 500000, currency: 'EUR' }, eventId)
sendServerEvent({
  eventName: 'Purchase',  // hay que agregar el tipo en track.ts y capi.ts
  eventId,
  customData: { value: 500000, currency: 'EUR' },
})
```

**2. Agregar el nuevo nombre** en los tipos de `track.ts` y `capi.ts`:
```ts
// En SendCapiEventParams.eventName y en sendServerEvent payload:
eventName: 'Lead' | 'Contact' | 'ViewContent' | 'PageView' | 'Purchase'
```

---

## Verificación

### Local
1. Agregar `META_CAPI_TEST_EVENT_CODE=TEST12345` en `.env.local`
2. `npm run dev`
3. Abrir consola → verificar `window.fbq` definido
4. En Events Manager → Pixel → Test Events:
   - Visitar `http://localhost:3000` → debe aparecer `PageView`
   - Visitar una propiedad → debe aparecer `ViewContent`
   - Enviar formulario → debe aparecer `Lead`
   - Click en WhatsApp → debe aparecer `Contact`

### Producción
- Network tab del browser → buscar requests a `facebook.com/tr` (client-side)
- Events Manager → verificar que los eventos aparecen con **"Received via Server"** además de **"Received via Browser"**
- Match Quality Score en Events Manager → objetivo: >7/10

---

## Deduplicación

Meta usa `event_id` para deduplicar. Si llegan dos eventos con el mismo `event_id` dentro de 48 horas, solo cuenta uno. Por eso el mismo UUID se pasa a `fbqTrack` (como 4º argumento `{ eventID }`) y a `sendServerEvent` (como campo `eventId`).
