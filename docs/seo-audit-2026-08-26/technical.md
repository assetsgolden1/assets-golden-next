# Auditoría SEO Técnico — assetsgolden.com

Fecha: 2026-08-26 · Muestra: 21 páginas + 12 checks de redirects/variantes (~33 requests, UA Mozilla, 1s entre requests)

## SCORE TÉCNICO: 82/100

Base muy sólida (canonicals, redirects, security headers, SSR completo, 404 real). Los puntos perdidos vienen de: `lang="es"` en las páginas inglesas, canonical de paginación que apunta a página 1, hreflang incompleto en blog/servicios/legales, y HTML muy pesado en home.

---

## Hallazgos por severidad

### CRITICAL
Ninguno.

### HIGH

**H1. Todas las páginas /en tienen `<html lang="es">`**
- Evidencia (`https://assetsgolden.com/en` y `/en/propiedades/baccarat-residences-miami-3149`):
  `<html data-dpl-id="..." lang="es" class="playfair_display...">`
- El contenido, title y meta description sí están en inglés, pero el atributo `lang` no cambia por locale. Confunde a buscadores, lectores de pantalla y a la detección de idioma; contradice el hreflang.
- Fix: en el root layout de next-intl, `<html lang={locale}>` (probablemente está hardcodeado `"es"` o el layout raíz no recibe el locale).

**H2. Canonical de la paginación apunta siempre a página 1 (115 páginas)**
- `https://assetsgolden.com/propiedades?page=2` → HTTP 200, renderiza server-side 24 fichas DISTINTAS de las de página 1 (verificado con diff), pero:
  `<link rel="canonical" href="https://assetsgolden.com/propiedades"/>`
- Con 115 páginas (`?page=115` enlazada desde el listado) y ~2.600 fichas, Google puede descartar las páginas 2–115 como duplicados de la 1, dejando ~2.576 fichas sin ruta de enlazado interno rastreable (solo sitemap). Es la causa más probable de indexación lenta/parcial de fichas.
- Fix: canonical autorreferente por página (`/propiedades?page=N`) manteniendo `index,follow`.

**H3. Hreflang ausente o inconsistente en secciones enteras**
- Sin ningún `<link rel="alternate" hreflang>`: `/blog`, `/servicios`, `/politica-de-privacidad` (verificado en HTML; el resto de la muestra sí los tiene).
- `/blog/rentabilidad-con-obra-nueva` usa `hrefLang="es-ES"` (el resto del sitio usa `es`) y no declara alternate `en` — inconsistencia de códigos y cobertura.
- Fix: unificar a `es`/`en`/`x-default` en todo el sitio; si un post no tiene versión EN, basta `es` + `x-default` coherentes con el resto.

### MEDIUM

**M1. HTML de la home muy pesado: 724 KB sin comprimir**
- 147 chunks `self.__next_f.push`, 98 `<img>`, 167 `<script>`. `/destinos/espana` 370 KB, `/propiedades` 330 KB. Las fichas están bien (~127–154 KB).
- Riesgo LCP/INP: mucho payload RSC serializado y demasiadas tarjetas renderizadas (54 enlaces a fichas desde home). Recortar secciones de la home o paginar/lazy-load listas embebidas.

**M2. `/es/...` redirige con 307 (temporal) en vez de 308/301**
- `curl https://assetsgolden.com/es` → `307 → https://assetsgolden.com/`
- `curl https://assetsgolden.com/es/propiedades/apartamento-en-estepona-25737` → `307 → /propiedades/...`
- 307 no consolida señales a largo plazo. Es el default de next-intl; configurar redirect permanente si es viable. Además la home enlaza internamente `href="/es"` (URL que redirige) como selector de idioma — mejor enlazar directo a `/`.

**M3. JSON-LD de la home sin entidad Organization/RealEstateAgent**
- Tipos presentes en home: `WebSite`, `SearchAction`, `OfferCatalog`, `PostalAddress`, `ImageObject`, `Country`×12. Falta un nodo `RealEstateAgent`/`Organization` con name/logo/sameAs/address como entidad principal (hay PostalAddress huérfano). Las fichas sí tienen `RealEstateListing` + `Offer` + `BreadcrumbList` (bien).

**M4. Sitemap: URLs EN no aparecen como `<loc>` y sin x-default**
- Las 2.813 `<loc>` son solo ES; las EN solo existen como `xhtml:link hreflang="en"` (válido, pero Google recomienda que cada versión tenga su propia entrada con `lastmod`). No hay `x-default` en el sitemap (sí en el HTML, así que es menor).

### LOW

**L1. CSP con `'unsafe-eval' 'unsafe-inline'` en script-src** — debilita la CSP (sin impacto SEO directo; anotar para seguridad).
**L2. `Access-Control-Allow-Origin: *` en la home** — revisar si es intencional.
**L3. Title del post en mayúsculas**: `<title>RENTABILIDAD CON OBRA NUEVA — Assets Golden</title>` — cosmético, CTR.
**L4. Home enlaza `/portal/login`** (bloqueado en robots.txt) — inofensivo, pero puede ir con `nofollow`.
**L5. ~2.400 `lastmod` idénticos (2026-04-26T18:10:5x)** — lastmod de bulk update, no de contenido real; le resta valor como señal de recrawl.

---

## Lo que está BIEN (no tocar)

1. **Canonicals**: autorreferentes y correctos en las 18 páginas muestreadas, ES y EN (ej. ficha EN → `https://assetsgolden.com/en/propiedades/baccarat-residences-miami-3149`).
2. **Hreflang en páginas principales**: `es`/`en`/`x-default` bidireccional y correcto en home, /propiedades, fichas, /destinos, /destinos/espana, /contacto; además duplicado en header HTTP `Link` de la home (refuerzo válido).
3. **Redirects impecables, un solo salto**: `www.` → 308 no-www; `http://` → 308 https; trailing slash → 308 sin slash (consistente); `/es/*` → sin prefijo (aunque 307, ver M2). Sin cadenas.
4. **404 real**: URL inexistente → HTTP 404 + `<meta name="robots" content="noindex"/>`. `/en/properties` → 404 (no hay alias duplicado).
5. **Security headers completos** (verificado en home, ficha Estepona y post de blog): `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, CSP presente, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
6. **SSR/SSG completo — cero dependencia de JS para el contenido**: en el HTML crudo de la ficha Estepona están el H1 (`Apartamento en Estepona`), el precio (`610.000` ×2) y la descripción completa. Fichas servidas con `X-Vercel-Cache: PRERENDER`, home `HIT` (Age 750).
7. **Structured data en fichas**: `RealEstateListing` + `Offer` + `BreadcrumbList` + `QuantitativeValue` — muy por encima de la media del sector.
8. **On-page consistente**: title y meta description únicos y descriptivos por página (con precio/habitaciones en fichas), H1 único en las 18 páginas, `meta robots index,follow` explícito, viewport correcto, OG tags (title/description/image/url).
9. **robots.txt** limpio (Allow /, Disallow /admin/ /portal/, Sitemap declarado) y sitemap 200 con 2.813 URLs + alternates + lastmod.
10. **Query strings** no generan duplicados: `?utm_source=`/`?ref=` devuelven 200 con canonical limpio (páginas prerenderizadas).
11. **LCP hints**: `<link rel="preload" as="image">` para el hero en home y fichas (2 preloads en ficha).
12. **Profundidad de clics razonable en teoría**: home → 54 fichas directas; /destinos/espana y /propiedades → 24 fichas cada una; blog y destinos enlazados desde home. (El cuello de botella es H2.)

## Prioridad de implementación
1. H1 (`lang` dinámico) — 1 línea de código, alto impacto i18n.
2. H2 (canonical de paginación autorreferente) — desbloquea el enlazado interno de ~2.600 fichas.
3. H3 (hreflang en blog/servicios/legales + unificar `es-ES`→`es`).
4. M1 (adelgazar HTML de home) y M2 (307→308 en /es).
