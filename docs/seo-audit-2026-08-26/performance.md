# Auditoría de Performance Web — assetsgolden.com

**Fecha:** 2026-08-26
**Método:** Lighthouse 13.4.1 local (CLI, Chrome headless, throttling simulado 4G/Moto G Power para mobile) + mediciones curl. La API pública keyless de PageSpeed Insights devolvió `429 RESOURCE_EXHAUSTED` con `quota_limit_value: 0` (cuota diaria del proyecto compartido agotada — no era rate limit temporal, reintentar espaciado no sirve). **Sin field data de CrUX** por el mismo motivo: los valores son de laboratorio. Recomendado repetir con API key propia (gratuita) para obtener percentil 75 real.

## Score global estimado: 67/100 (mobile)

Promedio de las 3 páginas mobile (59 / 74 / 68). Desktop home: 88/100.

## Métricas por página (Lighthouse mobile, lab)

| Métrica | Home `/` | Listado `/propiedades` | Ficha `/propiedades/2200-brickell-3159` | Umbral "good" |
|---|---|---|---|---|
| **Score Performance** | **59** | **74** | **68** | — |
| LCP | 14.3 s ❌ | 13.4 s ❌ | 7.2 s ❌ | ≤2.5 s |
| FCP | 2.5 s | 1.3 s | 1.8 s | ≤1.8 s |
| TBT (proxy lab de INP) | 210 ms | 100 ms | 160 ms | ≤200 ms |
| CLS | 0 ✅ | 0 ✅ | 0 ✅ | ≤0.1 |
| Speed Index | 11.5 s | 2.3 s | 5.6 s | — |
| TTFB (lab, doc raíz) | 30 ms | 30 ms | 30 ms | ≤200 ms* |
| TTFB (curl real) | 147 ms ✅ | **993 ms** ⚠️ | 540 ms ⚠️ | ≤200 ms |
| Peso total | 4.944 KiB | **14.090 KiB** | 1.235 KiB | — |
| — de imágenes | 4.192 KiB | **13.417 KiB** | ~700 KiB | — |

\* Los LCP de lab están inflados por el throttling simulado, pero el orden de magnitud del problema es real: hay 13+ MB de imágenes en el listado.

**Desktop home:** score 88 — FCP 0.5s, LCP 2.2s ✅, TBT 0ms, CLS 0. El problema es exclusivamente mobile.

## Elemento LCP por página

- **Home y Listado (mobile):** el LCP es el **texto del banner de cookies** (`p#cm__desc`), no el hero. El modal de cookies cubre el viewport mobile y se pinta tarde por JS (element render delay 2.355 ms en home, 1.269 ms en listado). El hero sí tiene `preload` + `imagesrcset` vía next/image (`hero-villa.jpg`), pero queda tapado.
- **Ficha:** el LCP sí es la imagen de galería, servida por **Supabase Image Transformation** (`/storage/v1/render/image/...`) ✅ — la migración de junio funciona ahí. Falla el checklist `priorityHinted`: **falta `fetchpriority="high"`** en la imagen (resource load delay 52ms + load 653ms + render delay 1.622ms).

## Hallazgos priorizados

### P1 — Imágenes del feed medianewbuild.com sin optimizar (impacto: LCP −9.1 s en listado según Lighthouse)
Las cards de propiedades de obra nueva usan los JPG **originales** del feed (`medianewbuild.com/file/hh-media-bucket/.../logo.jpg`), sin pasar por Supabase Transformation ni `/_next/image`:
- Listado: **13.330 KiB de ahorro estimado** (una sola imagen pesa 4.865 KiB; otras de 1.4 MB, 1.2 MB, 1.1 MB...).
- Home: **3.377 KiB de ahorro** (imagen de 3750×2810 px = 1.679 KiB mostrada a 694×433).
**Fix:** proxear las URLs de medianewbuild por el image loader (next/image con loader remoto o Supabase transform) para servir WebP/AVIF redimensionado. Hay `preconnect` a medianewbuild pero eso no compensa 13 MB.

### P2 — Banner de cookies se convierte en el elemento LCP en mobile (home y listado)
El modal se inyecta por JS tarde y tapa el viewport. Mientras exista, el LCP medido será el banner, no el hero optimizado.
**Fix:** cargar el script de consent con `defer` tras el first paint, usar formato barra inferior (no modal fullscreen) en mobile, o inline/SSR del banner para que pinte junto al HTML. Impacto directo en LCP field de todas las páginas.

### P3 — Falta `fetchpriority="high"` en la imagen LCP de las fichas
La imagen de galería es descubrible en el HTML inicial y no es lazy ✅, pero sin priority hint. En next/image: `priority` en el primer slide. Ahorro estimado: ~300–600 ms de LCP.

### P4 — Cache TTL de 4 h en imágenes del feed (ahorro 9.095 KiB en visitas repetidas)
`medianewbuild.com` sirve con `max-age` de 4 horas. Al proxearlas (P1) se resuelve también esto con cache inmutable propio.

### P5 — TTFB real alto en rutas ISR: `/propiedades` 993 ms, ficha 540 ms
El documento raíz en caliente responde en 30 ms; el ~1 s es cache MISS de ISR/edge (coincide con la nota de memoria sobre `revalidatePath` y locale). Verificar `X-Vercel-Cache`/`Age` y que la revalidación pegue en las rutas con prefijo de locale correcto para subir el hit-rate.

### Menores
- `unused-javascript`: ~27 KB / 160 ms en el chunk principal.
- 3 CSS render-blocking (~26 KB total, ~150 ms FCP/LCP).
- `icon.png` de 111 KB — comprimir/reducir.
- TBT 100–210 ms: al límite pero aceptable; vigilar INP en field data cuando haya CrUX.

## Lo que está bien
- **CLS = 0 en las 3 páginas** ✅ (dimensiones de imagen y sin shifts).
- TTFB del documento en caliente excelente (30 ms lab / 147 ms home real).
- Fuentes woff2 con preload; preconnect a los orígenes de imágenes.
- Hero del home con preload responsive vía next/image.
- Imágenes propias ya van por Supabase `/render/image` (WebP) ✅.
- Desktop pasa Core Web Vitals (LCP 2.2 s).

## Archivos de evidencia
- `lh-home-mobile.json`, `lh-listado-mobile.json`, `lh-ficha-mobile.json`, `lh-home-desktop.json` (mismo directorio)
