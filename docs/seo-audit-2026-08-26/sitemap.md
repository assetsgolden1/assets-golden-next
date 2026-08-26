# Auditoría de sitemap — assetsgolden.com

**URL:** https://assetsgolden.com/sitemap.xml
**Fecha de auditoría:** 2026-08-26
**Score: 68 / 100**

## Resumen ejecutivo

Sitemap único (no índice), XML válido, 2.813 URLs, 1,22 MB — muy dentro de los límites (50.000 URLs / 50 MB). Todas las URLs son absolutas, canónicas (https://assetsgolden.com), sin duplicados ni caracteres problemáticos. Incluye anotaciones hreflang es/en por URL (5.626 `xhtml:link`), algo poco común y positivo.

Los problemas graves son dos: **12 URLs del blog en el sitemap devuelven 404** (posts que solo existen en inglés bajo `/en/blog/` pero el generador los lista sin el prefijo de locale), y **ninguna URL `/en/` figura como `<loc>`** pese a que la versión EN existe y responde 200 (solo aparecen como alternates hreflang). Además, el `lastmod` se genera en el momento de la petición (2.783 de 2.813 URLs comparten el timestamp exacto de la descarga), lo que lo vuelve inútil y puede llevar a Google a ignorarlo en todo el sitio.

## Checklist de validación

| Check | Resultado | Evidencia |
|---|---|---|
| XML válido / formato urlset | PASS | `<?xml version="1.0" encoding="UTF-8"?>` + namespace 0.9 + xmlns:xhtml |
| Límite 50k URLs / 50 MB | PASS | 2.813 URLs, 1.225.463 bytes |
| URLs absolutas y host consistente | PASS | 0 URLs fuera de `https://assetsgolden.com` |
| Duplicados exactos | PASS | 0 |
| Caracteres problemáticos | PASS | 0 no-ASCII, 0 `%`, 0 `&amp;` |
| lastmod presente | PASS (formal) | 2.813/2.813 con lastmod, formato W3C válido |
| lastmod creíble | **FAIL** | 2.783/2.813 con timestamp de la propia petición (`2026-08-26T21:27:35.98xZ`); solo 8 fechas distintas en total |
| changefreq/priority | INFO | Presentes en las 2.813 URLs (2.756 weekly / 2.755 priority 0.8). Google los ignora; se pueden eliminar |
| URLs con 404 en sitemap | **FAIL** | 12/30 URLs de `/blog/` devuelven 404 (ver Alta severidad) |
| URLs con redirect en sitemap | PASS | 0 redirects en la muestra (los 308 de slugs legacy de julio no aparecen listados) |
| Cobertura EN | **FAIL** | 0 URLs `/en/` como `<loc>`, pese a que `/en`, `/en/blog/...`, `/en/propiedades/...`, `/en/destinos/...` devuelven 200 |
| hreflang en sitemap | PASS parcial | es + en por URL; falta `x-default` |

## Composición del sitemap (2.813 URLs, 100 % ES)

| Tipo | URLs | Notas |
|---|---|---|
| Fichas `/propiedades/` | 2.751 | Solo versión ES |
| Blog posts `/blog/*` | 30 | 18 responden 200; **12 devuelven 404** (posts EN listados sin `/en/`) |
| Blog raíz `/blog` | 1 | |
| Destinos `/destinos/*` | 13 | El pedido esperaba 12; hay 13 (España, México, Grecia, Argentina, Indonesia, Paraguay, Reino Unido, EE. UU., EAU, Costa Rica, Rep. Dominicana, Ecuador, Brasil) |
| Destinos raíz `/destinos` | 1 | |
| Home `/` | 1 | |
| Estáticas | 16 | vender-tu-piso, sobre-nosotros, servicios, propiedades, promociones, política-privacidad, política-cookies, partners, noticias, mi-demanda, inversiones, equipo, contacto, consejos, colabora, aviso-legal |
| **URLs `/en/...`** | **0** | La sección EN existe pero no está en el sitemap como `<loc>` |

## Hallazgos por severidad

### Alta

**H1. 12 URLs del blog en el sitemap devuelven 404 (40 % de las entradas de blog).**
Son los posts escritos en inglés: existen en `/en/blog/<slug>` (verificado 200) pero el sitemap los lista como `/blog/<slug>` (404). El hreflang `es` de esas entradas también apunta al 404. Es un bug del generador: emite el `<loc>` sin prefijo de locale para posts que solo tienen versión EN.
URLs afectadas (todas 404 verificadas con curl):
- /blog/spain-property-tax-non-residents
- /blog/buy-villa-marbella-international-buyers
- /blog/brexit-impact-uk-buyers-spain-2026
- /blog/buying-property-spain-foreigner-2026
- /blog/holiday-rental-yields-costa-del-sol
- /blog/buying-property-dubai-international-investors
- /blog/estepona-new-marbella-investment-guide
- /blog/costa-del-sol-vs-costa-blanca-invest-2026
- /blog/investing-tulum-real-estate-2026
- /blog/spanish-golden-visa-2026
- /blog/work-with-real-estate-consultant-exclusive-property
- /blog/checklist-mediterranean-second-home

Evidencia del bug (entrada en el sitemap):
```xml
<loc>https://assetsgolden.com/blog/spanish-golden-visa-2026</loc>  <!-- 404 -->
<xhtml:link rel="alternate" hreflang="en" href="https://assetsgolden.com/en/blog/spanish-golden-visa-2026" />  <!-- 200 -->
```

**H2. La versión EN completa está ausente como `<loc>` (~2.800 URLs indexables sin enviar).**
`/en` (200), `/en/propiedades/apartamento-en-estepona-24155` (200), `/en/blog/spanish-golden-visa-2026` (200), `/en/destinos/mexico` (200). Las URLs EN solo figuran como alternates hreflang; Google recomienda que cada URL indexable esté listada con su propio `<url>`. Nota: las rutas EN mantienen segmentos en español (`/en/propiedades/`, `/en/destinos/` — `/en/properties` y `/en/destinations` dan 404), lo cual es consistente pero conviene tenerlo claro al generar.

### Media

**M1. lastmod generado dinámicamente en cada request.**
2.783/2.813 URLs comparten el timestamp exacto de la descarga (1.927 × `2026-08-26T21:27:35.985Z`, 837 × `...984Z`, 19 × `...544Z`). Solo 30 URLs (blog) tienen fechas reales (abril–junio 2026). Un lastmod que cambia en cada crawl sin cambios reales hace que Google desconfíe y lo ignore para todo el sitio. Usar la fecha real de última modificación de cada ficha/página.

**M2. Faltan las 4 categorías del blog, que existen y devuelven 200:**
`/blog/consejos`, `/blog/inversiones`, `/blog/mercado`, `/blog/noticias` (todas verificadas 200, ausentes del sitemap).

### Baja

**B1. Falta `x-default` en los bloques hreflang.** Recomendado cuando hay más de un idioma.

### Info

**I1. `changefreq` y `priority` presentes en las 2.813 URLs.** Google los ignora desde hace años; eliminarlos reduce ~30 % el tamaño del archivo. Distribución: weekly 2.756, monthly 52, yearly 4, daily 1; priority 0.8 en 2.755.

**I2. Páginas esperadas presentes:** `/consejos`, `/noticias`, `/inversiones`, `/promociones`, `/partners`, `/vender-tu-piso`, `/colabora`, `/mi-demanda` — todas en el sitemap y todas 200.

## Muestreo de salud (20 URLs + escaneo completo del blog)

- 14 fichas `/propiedades/` al azar: **14/14 → 200**
- Home, `/consejos`, `/mi-demanda`, `/destinos/mexico`: **4/4 → 200**
- Blog (escaneo completo de las 30 entradas del sitemap): **18 → 200, 12 → 404, 0 redirects**
- Redirects 308 de slugs legacy: **ninguno detectado en el sitemap** (correcto)

## Acciones recomendadas (orden de impacto)

1. Corregir el generador: posts EN-only deben emitirse con `<loc>` = `/en/blog/<slug>` (elimina los 12 × 404).
2. Añadir las ~2.800 URLs `/en/...` como entradas `<url>` propias (o un segundo sitemap `sitemap-en.xml` con índice).
3. Usar `lastmod` real por página (updated_at de la BD para fichas, fecha de publicación/edición para blog).
4. Añadir las 4 categorías del blog y `x-default` en hreflang.
5. Opcional: eliminar `changefreq`/`priority`.

## Desglose del score (68/100)

| Dimensión | Puntos |
|---|---|
| Formato y límites (XML, tamaño, URLs absolutas, sin duplicados/caracteres raros) | 25/25 |
| Salud de URLs (12 × 404 en blog; fichas y estáticas 100 % sanas, sin redirects) | 15/25 |
| Cobertura (EN ausente como loc, categorías blog ausentes; estáticas y destinos completos) | 12/25 |
| Frescura/metadatos (lastmod no creíble; changefreq/priority obsoletos; hreflang presente sin x-default) | 16/25 |
