# Informe — Slugs HabiHub desincronizados

> Investigación read-only (SQL sobre prod, project `mromkwpqrxpxbbxhdofs`). Fecha: 2026-07-01.
> **NO se tocó ningún slug.** El fix es decisión de Ivan (ver "Riesgo" y "Opciones").

## Qué se investigaba
El backlog (PENDIENTES 7b) anotaba "~750 slugs habihub desincronizados": propiedades del feed cuyo
slug en DB no coincide con el que generaría la convención actual del sync.

Convención actual del INSERT del sync (`src/app/api/admin/sync-habihub/route.ts:486`):
```
slug = slugify(title) + '-' + external_id     // p.ej. villa-en-marbella-18492
```
El sync usa ese slug como una de las claves de match (`bySlug`), pero **matchea primero por `external_id`**.

## Hallazgos (números)
Sobre **2.589** propiedades `external_source='habihub'` con `external_id` numérico:

| Métrica | Valor |
|---|---|
| Slug termina en su `external_id` actual (OK) | **1.599** |
| **Slug desincronizado** (no termina en su external_id) | **990** |
| ↳ terminan en **otro número** (id viejo / secuencia legacy) | 782 |
| ↳ **no terminan en número** | 208 |
| Desync que están **live/públicas** (entran al sitemap) | **908** |
| Desync ocultas por sync (`hidden_by_sync`) | 82 |

Nota: son **990**, no ~750 — el número creció desde que se anotó el pendiente.

## Patrón real (importante)
No es "external_id viejo pegado al final". Es un **esquema de slug legacy completo**, distinto al actual:

| Slug en DB (legacy) | external_id actual | title (español) | Slug que generaría hoy |
|---|---|---|---|
| `villa-en-marbella-marbella-26` | 18492 | Villa en Marbella | `villa-en-marbella-18492` |
| `apartment-en-benalmadena-benalmadena-7` | 30146 | Apartamento en Benalmádena | `apartamento-en-benalmadena-30146` |
| `terraced-en-torremolinos-torremolinos` | 25913 | Adosado en Torremolinos | `adosado-en-torremolinos-25913` |

Diferencias del esquema legacy:
- **Tipo en inglés** (`villa`, `apartment`, `ground-floor`, `terraced`, `detached`, `penthouse`) vs. título en español.
- **Location duplicada** (`...-marbella-marbella`).
- Sufijo = **secuencia corta** (`-26`, `-7`) o **nada**, en vez del `external_id`.

## Origen temporal
No es un único batch. Se reparte por lotes de importación previos a la convención actual:

| Día de creación | Desync |
|---|---|
| 2026-01-15 | 405 |
| 2026-03-11 | 254 |
| 2026-04-02 | 158 |
| 2026-05-01 | 83 |
| 2026-03-15 | 51 |
| resto | ~39 |

## ¿Rompe algo hoy? NO
- El **sync sigue actualizándolas bien**: matchea por `external_id` (único), no depende del slug legacy.
- Las fichas **resuelven y renderizan normal** (la ruta es `/propiedades/[slug]`, sirve cualquier slug existente).
- Es un problema de **consistencia + SEO**, no funcional. Slugs en inglés con location duplicada
  son peores para SEO en un sitio ES que `tipo-español-ciudad-id`.

## Riesgo del fix (por esto lo decide Ivan)
- **908 de estas URLs están en el sitemap** → enviadas a Google → potencialmente indexadas.
- Cambiar un slug **rompe la URL indexada** (404) salvo que se ponga un **redirect 301** viejo→nuevo.
- Atenuante: por ESTADO.md, la indexación real es incipiente (esencialmente solo la home). El footprint
  indexado real probablemente sea chico → **conviene hacerlo pronto**, mientras haya poco que redirigir,
  no después.

## Colisiones: el fix es seguro
`external_id` es **100% único** (2.589 distintos / 2.589) y los slugs actuales también. Como el slug
normalizado termina en `-{external_id}`, es **imposible que colisione** con otro. El renombrado es
determinista y sin duplicados.

## Opciones para Ivan
1. **No tocar** — cero riesgo SEO, se queda la inconsistencia. Los slugs nuevos ya salen bien; el legacy
   se va diluyendo. Válido si no se quiere gestionar redirects.
2. **Normalizar con redirects 301** (recomendado si se quiere cerrar): re-slug a `slugify(title)-external_id`
   + tabla/map de redirects `old_slug → new_slug` (301) para no perder lo indexado. Requiere:
   - un `redirects()` en `next.config` o middleware que lea el map (908 entradas, o un patrón).
   - regenerar sitemap (ya sale del slug nuevo).
   - hacerlo **de una** (mientras Google indexó poco).
3. **Solo las ocultas / no indexadas primero** — renombrar las 82 `hidden_by_sync` (no están en sitemap →
   sin riesgo) para validar el proceso, y decidir las 908 live después.

## Reproducir el análisis
Filtro base: `external_source='habihub' AND external_id ~ '^[0-9]+$' AND slug NOT LIKE '%-'||external_id`.
