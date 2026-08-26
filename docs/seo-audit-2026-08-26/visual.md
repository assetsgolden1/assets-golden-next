# Análisis visual SEO — assetsgolden.com

**Fecha:** 2026-08-26
**Método:** Screenshots reales con Playwright (playwright-core + Chromium 1217 local, headless). NO se usó el fallback de curl para lo visual; curl solo para sitemap y verificación de cookies en HTML.
**Screenshots:** `C:\Users\Asus\AppData\Local\Temp\claude\C--Users-Asus-Desktop-proyecto-AssetsGikden-Full\e27effe7-0360-429e-aa2e-80182b7e4ee7\scratchpad\seo-audit\screenshots\`

- `home-mobile.png` (375x812, DPR 3, UA iPhone)
- `home-desktop.png` (1280x800)
- `propiedad-mobile.png` (375x812) — /propiedades/adosado-en-estepona-10339
- `listado-mobile.png` (375x812) — /propiedades

## Score: 78/100

---

## 1. Home

### Mobile (375x812)
**Above-the-fold se ve:** header oscuro con logo AG + hamburguesa, kicker "INTERNATIONAL REAL ESTATE CONSULTING", H1 dorado "PROPIEDADES EXCLUSIVAS, SIN FRONTERAS" (top a 293px, totalmente visible), subtítulo, CTA primario dorado "Solicitar tasación gratuita" y CTA secundario "Ver propiedades". FAB de WhatsApp abajo a la derecha.

- H1 visible sin scroll: SÍ
- CTA visible sin scroll: SÍ (dos, con buena jerarquía visual y touch targets grandes ~95px de alto)
- Banner de cookies: NO apareció en carga inicial (contexto limpio, networkidle + 3s). En el footer existe "Configurar cookies", así que el CMP carga diferido o solo bajo ciertas condiciones. **No tapa contenido above-the-fold.**
- Sin scroll horizontal (scrollWidth 375 = viewport). Texto legible, contraste correcto.
- Detalle menor: el header es alto (~195px CSS) por el logo grande; se podría compactar para ganar hero.

### Desktop (1280x800)
- H1 y ambos CTAs visibles sin scroll. Nav completa (Propiedades, Destinos, Servicios, Nosotros, Inversiones, Blog, Contacto, DESTACADAS, buscador, ES/EN).
- Sidebar izquierda con "Países" (España 871, EEUU 69, Indonesia 35…) — buen internal linking above-the-fold, aunque le roba ~288px de ancho al hero.
- Detalle: el botón "Asesoría gratuita" del header queda cortado en el borde derecho a 1280px (se lee "As…"). Revisar breakpoint ~1280.
- Sin banner de cookies visible.

## 2. Ficha de propiedad (mobile) — adosado-en-estepona-10339

**Above-the-fold se ve:** header, breadcrumb (Inicio > Propiedades > Adosado en Estepona), link "Volver a propiedades", **galería completa** (foto 1/16 con botón "Ver las 16" bien visible), y debajo el badge "Adosado" + ubicación "Estepona, Málaga", el **H1 "Adosado en Estepona"** (top 552px, visible), Ref AG-01647 y el **precio "900.000 €"** justo dentro del fold (~645px CSS).

- Galería visible sin scroll: SÍ
- Precio visible sin scroll: SÍ (justo, al límite del fold)
- CTA de contacto visible sin scroll: **NO** — el único contacto above-the-fold es el FAB de WhatsApp (que además se superpone parcialmente con la cifra de m² de las características). No hay botón "Contactar/Solicitar información" ni sticky CTA en el primer viewport.
- Hallazgo de layout: hay un **hueco blanco notable (~60-70px)** entre la galería y el bloque de badge/título — espacio desaprovechado que empuja precio y features hacia abajo.
- Title SEO muy bueno: "Adosado en Estepona, Málaga · 3 hab · desde 900.000 € — Assets Golden".

## 3. /propiedades (mobile)

**Above-the-fold:** hero azul oscuro ("SELECCIÓN EXCLUSIVA" + H1 "Propiedades exclusivas" + "2751 propiedades encontradas") ocupa ~46% del viewport; luego botón "Filtros", el contador repetido "2751 propiedades encontradas", y recién a ~550px CSS empiezan las tarjetas.

- **Propiedades visibles sin scroll: ~2 tarjetas parciales** (imagen + título + precio a medias; el DOM reporta 4 links de tarjeta tocando el viewport, pero visualmente solo se aprecian 2 incompletas). Ninguna tarjeta completa entra en el primer viewport.
- Hallazgo grave de datos: la primera tarjeta muestra **"Villa en Marbella — 0 €"** (precio cero en la primera posición del listado; pésimo para conversión y para snippets).
- El contador "2751 propiedades encontradas" aparece duplicado (hero + encima del grid).
- Hero demasiado alto para una página de listado: en mobile conviene reducirlo a ~25% para mostrar al menos 1 tarjeta completa above-the-fold.
- Sin scroll horizontal; FAB de WhatsApp tapa parte del precio de la 2ª tarjeta ("2.900.000 €" queda medio cubierto).

## Resumen de hallazgos priorizados

| # | Severidad | Hallazgo |
|---|-----------|----------|
| 1 | Alta | Ficha de propiedad mobile sin CTA de contacto explícito above-the-fold (solo FAB WhatsApp) — agregar botón/sticky "Solicitar información" |
| 2 | Alta | Listado /propiedades: primera propiedad con precio "0 €" — filtrar o mostrar "Consultar precio" |
| 3 | Media | Hero de /propiedades ocupa ~46% del viewport mobile; solo ~2 tarjetas parciales visibles |
| 4 | Media | Hueco blanco (~60-70px) entre galería y título en la ficha mobile |
| 5 | Media | FAB de WhatsApp se superpone a contenido (m² en ficha, precio en listado) |
| 6 | Baja | Botón "Asesoría gratuita" cortado en desktop a 1280px |
| 7 | Baja | Header mobile alto (~195px) por el logo; contador de resultados duplicado en listado |

## Puntos fuertes
- H1 y CTA dual visibles above-the-fold en home mobile y desktop.
- Banner de cookies no obstruye la primera carga.
- Sin overflow horizontal en ninguna página mobile; tipografía legible sin zoom.
- Galería, H1, ref y precio de la ficha entran en el primer viewport mobile.
- Titles descriptivos con precio y ubicación; breadcrumbs presentes.

## Desglose del score (78/100)
- Home mobile above-the-fold: 18/20
- Home desktop: 8/10 (botón cortado a 1280px)
- Ficha propiedad mobile: 14/20 (sin CTA contacto, hueco blanco)
- Listado mobile: 11/20 (hero excesivo, 0 €, tarjetas parciales)
- Responsividad general / sin overflow: 15/15
- Cookies / obstrucciones: 12/15 (FAB WhatsApp tapa contenido; CMP no verificable en interacción)
