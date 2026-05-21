# Daily Log — Assets Golden Next

> Bitácora operativa del proyecto. Claude Code lee este archivo al
> iniciar sesión y lo actualiza al cerrar. NO modificar manualmente
> la sección "Historial de sesiones" — solo agregar entradas nuevas
> arriba.

---

## 🔴 Pendientes activos (orden de prioridad)

Lista viva. Claude Code la actualiza al final de cada sesión:
marca con `[x]` lo terminado, agrega nuevos pendientes detectados,
reordena si la prioridad cambió.

### Bloqueantes para go-live
- [x] BotID Basic implementado en formularios (reemplaza Cloudflare Turnstile — 3 endpoints + 1 server action)
- [ ] Refactor pipeline de leads: eliminar n8n, consolidar en `processLead`, agregar Resend a todos los endpoints (depende de acceso Resend de Atilio)
- [ ] Rotación de claves SUPABASE_SERVICE_ROLE_KEY y GOOGLE_SHEETS_CREDENTIALS_JSON
- [ ] Páginas legales GDPR: política de privacidad, términos, banner cookies (BORRADORES creados con [PLACEHOLDER]; pendiente validación legal y banner)
- [ ] Atilio o asesor legal: validar texto de las 3 páginas legales (`/politica-de-privacidad`, `/aviso-legal`, `/politica-de-cookies`) y reemplazar todos los `[PLACEHOLDER: …]` por valores reales (razón social, CIF, domicilio, registro mercantil, teléfono, emails, jurisdicción) — **CASI COMPLETO**: todos los 7 datos reemplazados excepto Tomo del Registro Mercantil (ver pendiente abajo)
- [ ] Atilio: aceptar/firmar los DPAs en los dashboards de Supabase, Vercel, Cloudflare, Google, Resend y Upstash. Algunos requieren accept-click, otros solicitar al soporte. Sin DPA aceptado, la frase de la política de privacidad §5 es inexacta.
- [ ] Aviso GDPR en formularios `/contacto` y `/mi-demanda`
- [ ] DNS de Atilio para conectar dominio assetsgolden.com

### Importantes (post go-live)
- [x] Audit log de cambios admin
- [ ] EL-1/F — Sección "Propiedades similares" en /propiedades/[slug] (diferido de Fase 3.A — Bloque 4)
- [ ] Migración de 166 imágenes legacy de Lovable a Supabase actual
- [ ] Test PDF en producción end-to-end con agente real
- [ ] Auditoría proyecto Supabase huérfano `yagrwbmsufpvjcgxkuoz`
- [ ] Definir criterios `/inversiones` con Atilio
- [ ] Monitoreo del cron y alertas
- [ ] Opt-out de AI training en Vercel Team Settings (revisar al migrar a Pro). Iván buscó en General, Security & Privacy, Billing, Members, Drains, Alerts del plan Hobby actual — toggle no visible. Posibilidades: (a) opción solo disponible en Pro, (b) Vercel movió/eliminó el setting, (c) está en sub-página no obvia. Re-evaluar después de upgrade.

### Limpieza técnica
- [ ] Borrar backup `properties_backup_20260429` (después de 1-2 crons sin issues)
- [ ] Limpiar variable zombie `conflictIds` del sync
- [ ] Actualizar `fast-xml-parser` de `^5.5.12` a `^5.7.0` (vuln MODERATE: XML comment/CDATA injection)
- [ ] Corregir `react-hooks/set-state-in-effect` en `PortalPropertiesGrid.tsx:341` (nueva regla React 19 en eslint-config-next@16.2.6) — nota: `nueva-propiedad/page.tsx` fue reescrito en sesión 9, verificar si el lint error persiste
- [ ] Refactor: extraer `<PropertyGalleryUpload />` como componente compartido entre create y edit forms (hoy es copy-paste idéntico)
- [x] Borrar carpeta vacía `src/app/admin/destinos/`
- [x] Borrar carpeta vacía `src/app/api/admin/update-destino/`
- [x] CSP: remover `api.anthropic.com`
- [x] Verificar bucket `team-photos` en Supabase (existe, público)

### Pendientes operativos (Atilio)
- [ ] Confirmar Tomo y Folio del Registro Mercantil de Barcelona con Atilio — bloqueante atenuado: Tomo y Folio quitados del texto público para no publicar con placeholder. Cuando Atilio los confirme, agregar al final de la cadena registral: `...Hoja B-562057, Inscripción 2, Tomo X, Folio Y`
- [ ] Acceso a cuenta Resend (dominio assetsgolden.com ya está verificado en su cuenta)
- [ ] Email del socio para crear cuenta admin
- [ ] Acceso al panel DNS del dominio
- [ ] Validar criterios `/inversiones`
- [ ] Firma de contrato comercial formal
- [ ] Decisión sobre infraestructura (cuentas IBott vs Assets Golden)
- [ ] Acceso Meta Business Manager, Google Ads, GA4, Search Console (Fase 2)

---

## 📝 Historial de sesiones

Append-only. Cada entrada nueva va ARRIBA (más reciente primero).
Formato: fecha, contexto, decisiones tomadas, archivos tocados,
commits, próximo paso sugerido.

---

### Sesión 2026-05-21 — feat(seo): Bloque 3.A — Hreflang + Enlazado interno

**Contexto:** Fase 3.A del plan SEO (Plan-SEO-AssetsGolden_1.docx). Dos acciones técnicas sin dependencias editoriales: AM-3 (hreflang) y EL-1 (enlazado interno — 21 páginas con 1 solo enlace entrante según SEMrush).

**Auditorías realizadas antes de implementar:**
- AM-3: BD confirmó 10 posts EN + 13 posts ES. Los posts EN NO son traducciones de los ES (contenido independiente, sin campo de pairing). El `blog_posts` tiene `title_en/content_en` legacy pero no `translation_of`. Hreflang bilateral de pares N/A; se implementa self-referencial por idioma.
- EL-1: `/partners` solo enlazado desde HomeSidebar y back-button de fichas. Footer existente tenía `footerLinks.empresa` definido pero nunca renderizado. `/sobre-nosotros` y `/servicios` mencionaban partners en texto plano sin enlazar. `/partners/[id]` sin sección de otros partners. `/vender-tu-piso` sin links contextuales.

**Trabajo hecho:**

**AM-3** (`7da76be`): `alternates.languages` en `generateMetadata()` de `blog/[slug]/page.tsx`:
- Posts EN → `hreflang="en"` self + `x-default` → homepage
- Posts ES → `hreflang="es-ES"` self + `x-default` → self
- Limitación conocida: `<html lang>` permanece `"es"` en root layout (App Router sin reestructura de rutas). Los `<link rel="alternate" hreflang>` en `<head>` son suficientes para Google.

**EL-1** (`51ad3f6`):
- Footer: columna "Empresa" añadida (5 links: Sobre Nosotros, Equipo, Red de Partners, Blog, Contacto). Grid cambia `lg:grid-cols-4 → lg:grid-cols-5`. `footerLinks.empresa` existía pero nunca se renderizaba.
- `/sobre-nosotros`: Link "Ver red de partners →" en sección "Red internacional" (bloque navy derecho).
- `/servicios`: Botón "Conocer a nuestros partners" → /partners en sección "Presencia internacional".
- `/vender-tu-piso`: Sección contextual al pie con links → /propiedades y → /sobre-nosotros.
- `/partners/[id]`: Sección "Otros partners" (3 cards). Nueva función `getRelatedPartners()` en `queries.ts` — prioriza mismo país, completa con otros si no hay suficientes.
- Diferido: `F` — "Propiedades similares" en `/propiedades/[slug]` → anotar en pendientes Bloque 4.

**Decisiones de diseño:**
- `footerLinks.empresa` tenía key duplicable en `servicios` (`href="/servicios"` aparece 2 veces). Para empresa se usa `key={link.href + link.label}` — defensivo.
- `getRelatedPartners` no valida UUID del `currentId` explícitamente; el gate es `getPartnerById` que llama `notFound()` si el ID no existe antes de que se llame a `getRelatedPartners`.

**Archivos tocados:**
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx` (AM-3)
- MODIFIED: `src/components/Footer.tsx` (EL-1 A)
- MODIFIED: `src/app/(public)/sobre-nosotros/page.tsx` (EL-1 B)
- MODIFIED: `src/app/(public)/servicios/page.tsx` (EL-1 C)
- MODIFIED: `src/app/(public)/partners/[id]/page.tsx` (EL-1 D)
- MODIFIED: `src/app/(public)/vender-tu-piso/page.tsx` (EL-1 E)
- MODIFIED: `src/lib/supabase/queries.ts` (nueva fn `getRelatedPartners`)

**Commits:**
- `7da76be` feat(seo): AM-3 hreflang declarativo en blog/[slug]
- `51ad3f6` feat(seo): EL-1 enlazado interno — footer, sobre-nosotros, servicios, vender-tu-piso, otros partners

**Próximo paso sugerido:**
- Push de `7da76be` y `51ad3f6` a origin/main cuando Iván dé OK
- Bloque 3.B (pendiente definir con Iván qué acciones incluye)
- EL-1/F (propiedades similares) → Bloque 4

---

### Sesión 2026-05-21 (cierre) — chore(brand+seo): correcciones menores post-Bloque-2

**Contexto:** Dos correcciones detectadas tras el cierre del Bloque 2: razón social incorrecta en el footer y horarios del schema /contacto desalineados con Google Business Profile.

**Trabajo hecho:**
- Footer: reemplazada razón social "CFG Global Investment S.L." → "COVA FUMADA GROUP S.L." (solo texto de copyright, sin tocar estructura)
- Schema /contacto: horarios actualizados a L-S 08:00-20:00 (añadido Saturday, opens 09:00→08:00, closes 19:00→20:00) para coincidir con GBP

**Archivos tocados:**
- MODIFIED: `src/components/Footer.tsx`
- MODIFIED: `src/app/(public)/contacto/page.tsx`

**Commits:**
- `9bce336` chore(brand+seo): footer razón social correcta + horarios schema alineados con GBP

**Próximo paso sugerido:**
- Verificar en producción (Vercel) que el deploy del commit `9bce336` sea exitoso
- Continuar con Bloque 3 del plan SEO o revisar pendientes de Atilio

---

### Sesión 2026-05-21 — feat(seo): Bloque 2 completo — Schema markup global y por página

**Contexto:** Ejecución del Bloque 2 del plan SEO (Plan-SEO-AssetsGolden_1.docx). Objetivo: implementar schema markup correcto en todas las entidades clave del sitio. Sesión repartida en dos contextos (compactado a mitad); datos confirmados en sesión anterior.

**Trabajo hecho:**
- **AC-1** (`a788c49`): Schema global en layout — `src/components/seo/GlobalSchemaOrg.tsx` con `@graph` conteniendo `["LocalBusiness","RealEstateAgent"]` + `WebSite` + `SearchAction`. Validado con seo-schema: 0 FAIL, 2 WARN aceptados. Iteraciones: 3 rondas de refinamiento (target EntryPoint→string, @type array simplificado y revertido, @type string simple descartado por WARN de rich results).
- **SC-6** (`5153de8`): Componente reutilizable `src/components/seo/Breadcrumb.tsx` con JSON-LD BreadcrumbList + nav visible. Variante `secondary` para destinos (fondo bg-secondary). Instalado en propiedades/[slug], destinos/[slug], destinos/espana, blog/[slug] (nuevo en blog).
- **AH-6** (`b3cafac`): RealEstateListing schema mejorado en propiedades/[slug] — precio en `Offer` con `availability`, `numberOfRooms`, `floorSize QuantitativeValue`, `@id`, `seller` referencia a #organization, `addressRegion`.
- **SC-3** (`84851c4`): LocalBusiness/RealEstateAgent schema en /contacto — corrige name (era "Assets Golden International"), telephone E.164, agrega address PostalAddress con dirección real (schema-only, no visible en UI).
- **SC-5** (`ed8cc29`): BlogPosting schema mejorado en blog/[slug] — author/publisher via @id en lugar de objetos inline duplicados, @id propio, inLanguage desde post.language. FAQPage sin cambios (ya era correcto).
- **SC-4**: EXPLÍCITAMENTE DIFERIDO — bloqueado hasta que Atilio provea certificaciones reales del equipo.

**Decisiones de diseño:**
- `@type: ["LocalBusiness", "RealEstateAgent"]` como array explícito (no string simple) para activar LocalBusiness rich results en Google
- `SearchAction.target` como string directo (no objeto EntryPoint) — formato actual de Google
- address en /contacto incluida en schema pero NO mostrada en UI (decisión de privacidad anterior)
- numberOfItems: 2364 estático aceptado — coste de hacerlo dinámico supera el beneficio

**Archivos tocados:**
- CREATED: `src/components/seo/GlobalSchemaOrg.tsx`
- CREATED: `src/components/seo/Breadcrumb.tsx`
- MODIFIED: `src/app/layout.tsx` (import GlobalSchemaOrg)
- MODIFIED: `src/app/(public)/propiedades/[slug]/page.tsx` (AH-6 + SC-6)
- MODIFIED: `src/app/(public)/destinos/[slug]/page.tsx` (SC-6)
- MODIFIED: `src/app/(public)/destinos/espana/page.tsx` (SC-6)
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx` (SC-5 + SC-6)
- MODIFIED: `src/app/(public)/contacto/page.tsx` (SC-3)
- DELETED: `src/components/GlobalSchemaOrg.tsx` (movido a seo/ subdir)
- DELETED: `validate-schema.js` (residuo del agente seo-schema)

**Commits:**
- `a788c49` feat(seo): AC-1 schema Organization global
- `5153de8` feat(seo): SC-6 BreadcrumbList — componente reutilizable con JSON-LD
- `b3cafac` feat(seo): AH-6 RealEstateListing schema enriquecido en propiedades/[slug]
- `84851c4` feat(seo): SC-3 LocalBusiness/RealEstateAgent schema en /contacto
- `ed8cc29` feat(seo): SC-5 BlogPosting schema enriquecido en blog/[slug]

**Próximo paso sugerido:**
- Push de los 5 commits del Bloque 2 a origin/main
- Bloque 3 del plan SEO (si existe) o revisar si quedan acciones pendientes del documento
- SC-4 (Person schema equipo) queda bloqueado hasta que Atilio provea datos reales de certificaciones

---

### Sesión 2026-05-20 — feat(seo): Bloque 1 completo — correcciones técnicas SEO inmediatas

**Contexto:** Ejecución del Bloque 1 del plan SEO aprobado (Plan-SEO-AssetsGolden_1.docx). Objetivo: corregir los errores técnicos de mayor impacto sin dependencias externas. Sesión repartida en dos contextos (compactado a mitad).

**Trabajo hecho:**
- **AC-2** (ya committeado en sesión anterior, `e22fc68`): canónicas autorreferenciales en las 28 rutas públicas ✓
- **AC-3** (`d0ba2b2`): `openGraph.url` dinámico por página — sobreescribe el og:url fijo a la home en las 28 rutas estáticas y en los 5 `generateMetadata` dinámicos
- **AH-5** (`4be6d93`): elimina doble branding en títulos — home usa `{ absolute }`, resto pierde el sufijo de marca para que el template del layout lo añada una sola vez
- **TT-1** (`12f2524`): títulos y descripciones únicos — soluciona colisión `/consejos` vs `/blog/consejos`; quita `| Assets Golden` de títulos dinámicos en destinos; expande 8 descripciones cortas a ~150 chars; atribuye "15 años" al equipo (no a la marca); fallback de propiedades sin precio
- **TW-1** (`521ffde`): Twitter Card dinámica — quita `twitter:title/description` fijos del root layout; añade `twitter.images` con la imagen propia en propiedades/[slug], blog/[slug] y destinos/[slug]
- **AC-5** (`706419e`): activa caché HTTP — elimina `force-dynamic` de la home; cambia `Cache-Control` en `next.config.ts` de `no-store` a `s-maxage=3600, stale-while-revalidate=86400`
- **AH-1**: ya estaba implementado (HeroImageCarousel y PropertyGalleryClient ya tenían `priority` en la primera imagen) — sin cambio de código
- **AH-3** (`4f480c7`): preconexiones a CDN — `link rel=preconnect` en layout.tsx para los dos buckets Supabase activos y medianewbuild.com
- **AH-2** (`c7151cd`): crea `public/llms.txt` con entidad, razón social correcta (COVA FUMADA GROUP, SOCIEDAD LIMITADA), páginas principales, especialidades y licencia de contenido

**Archivos tocados:**
- MODIFIED: `src/app/layout.tsx` (TW-1 + AH-3)
- MODIFIED: `src/app/(public)/page.tsx` (AC-5)
- MODIFIED: `next.config.ts` (AC-5)
- MODIFIED: `public/llms.txt` (CREATED — AH-2)
- MODIFIED: 28 archivos `page.tsx` en `src/app/(public)/` (AC-3, AH-5, TT-1)
- MODIFIED: `src/app/(public)/propiedades/[slug]/page.tsx` (TW-1)
- MODIFIED: `src/app/(public)/blog/[slug]/page.tsx` (TW-1)
- MODIFIED: `src/app/(public)/destinos/[slug]/page.tsx` (TW-1 + TT-1)
- MODIFIED: `src/app/(public)/destinos/espana/page.tsx` (TT-1)

**Commits:**
- `d0ba2b2` feat(seo): AC-3 — og:url dinámico en las 28 rutas públicas
- `4be6d93` feat(seo): AH-5 — eliminar doble branding en títulos de página
- `12f2524` feat(seo): TT-1 — títulos y descripciones únicos en todas las páginas
- `521ffde` feat(seo): TW-1 — Twitter Card dinámica por página
- `706419e` feat(seo): AC-5 — activar caché HTTP en la home
- `4f480c7` feat(seo): AH-3 — preconexión a CDN externos de imágenes
- `c7151cd` feat(seo): AH-2 — publicar llms.txt para motores de IA (GEO)

**Próximo paso sugerido:**
Bloque 2 — Schema markup. Depende de 3 datos a confirmar con Atilio:
1. Razón social: COVA FUMADA GROUP, SOCIEDAD LIMITADA (a validar con Atilio)
2. Número exacto de países en la red de partners
3. URL del perfil LinkedIn de empresa de Assets Golden
Sin estos datos, NO ejecutar AC-1 (schema Organization global).

---

### Sesión 2026-05-20 — fix(contacto): eliminar mapa y dirección física — solo 3 canales de contacto

**Contexto:** Iván pidió quitar todo lo relacionado con el mapa embebido y la dirección física de `/contacto`, dejando únicamente 3 canales: teléfono, email y WhatsApp. Las páginas legales deben conservar la dirección completa (obligatorio legal).

**Trabajo hecho:**
- `contacto/page.tsx` reescrito:
  - Eliminado `MapPin` de imports de lucide-react; añadido `MessageCircle` para WhatsApp
  - `contactItems` ahora son 3: Phone (+34 611 85 30 01), Mail (hola@assetsgolden.com), WhatsApp (wa.me/34611853001)
  - Eliminado el bloque `<iframe>` de Google Maps
  - Eliminados `address` y `geo` del JSON-LD schema (evita publicar dirección en datos estructurados)
  - Actualizado encabezado: "Nuestra oficina" → "Información de contacto"
  - Actualizada metadata description: eliminada referencia "Oficina en Barcelona"
  - Simplificado render de items: todos tienen href, eliminado condicional `href ? <a> : <p>`
- **Verificación páginas legales:**
  - `aviso-legal/page.tsx` l.37: "José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)" ✓
  - `politica-de-privacidad/page.tsx` l.37: "José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)" ✓
  - `politica-de-cookies/page.tsx`: no tiene dirección postal (correcto — la política de cookies no la requiere legalmente) ✓
- Build: `Compiled successfully in 17.9s`, TypeScript OK, **1109 páginas**, `/contacto` como `○ (Static)` ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/contacto/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — pendiente validación visual de Iván.

**Próximo paso sugerido:**
1. Iván abre `/contacto` en dev server y verifica que aparecen los 3 canales (Teléfono, Email, WhatsApp), que el mapa ya no está, y que los enlaces funcionan (tel:, mailto:, wa.me)
2. Si OK: commit `fix(contacto): eliminar mapa + dirección — solo 3 canales` + push

---

### Sesión 2026-05-13 — CIERRE FORMAL (resumen del día + commits reales)

**Nota:** Las 4 entradas individuales de abajo dicen "Commits: NO" porque fueron escritas antes de que Iván validara y autorizara. Esta entrada documenta los commits reales y cierra la sesión formalmente.

**Commits del día (en orden cronológico):**

| Hash | Descripción |
|------|-------------|
| `1ff4bf8` | fix(propiedades): paginador pagina→page |
| `06f02c4` | feat(seo): 3 redirects español + metadata openGraph/twitter + sitemap |
| `e9c7720` | feat(brand): assets de marca v1 (icon.png + opengraph-image.png + favicon.ico) |
| `e9a8b86` | fix(brand): favicon v2 — solo círculo AG+león, sin texto (legible a 16×16) |
| `c39526d` | fix(brand): borrar favicon.ico duplicado en src/app/ |
| `94796e6` | feat(seo): 12 redirects inglés Lovable + handler dinámico /property/UUID |

**Operaciones DB (sin commit — vía MCP directo):**
- RLS habilitado en tabla `user_roles`
- 2 backups creados en Supabase

**Estado final del día:**
- Todos los commits pusheados a `origin/main` ✓
- Árbol de trabajo limpio (`nothing to commit, working tree clean`) ✓
- Build: 1109 páginas estáticas, 0 errores TypeScript ✓
- Vercel deployando `94796e6` automáticamente

**Pendientes abiertos que siguen igual (no atacados hoy):**
- Refactor pipeline leads (Resend), rotación de claves, GDPR forms, DNS — todos bloqueados por Atilio

---

### Sesión 2026-05-14 — redirects 301 slugs en inglés de Lovable + handler /property/[uuid]

**Contexto:** Google había indexado la web cuando estaba en Lovable en inglés. Los 3 redirects del commit `06f02c4` cubrían slugs en español; faltaban todos los slugs en inglés que también daban 404. Además, Lovable usaba UUIDs para identificar propiedades (`/property/UUID`) y Next.js usa slugs (`/propiedades/slug`).

**Trabajo hecho:**
- `next.config.ts`: agregados 12 redirects 301 para slugs en inglés en la sección `redirects()` existente:
  `/contact→/contacto`, `/properties→/propiedades`, `/investments→/inversiones`, `/sell→/vender-tu-piso`, `/about→/sobre-nosotros`, `/services→/servicios`, `/promotions→/promociones`, `/team→/equipo`, `/destinations→/destinos`, `/news→/noticias`, `/tips→/consejos`, `/my-demand→/mi-demanda`
  — `/partners` NO incluido: la ruta ya existe en Next.js (`src/app/(public)/partners/page.tsx`)
- Creado `src/app/property/[id]/page.tsx`: handler dinámico que recibe UUID, valida formato con regex, busca `slug` en Supabase con `createStaticClient()`, y hace `permanentRedirect()` (308) a `/propiedades/[slug]`. Si UUID inválido o no encontrado → `notFound()` (404).
  — Fix necesario respecto al spec: `RedirectType.permanent` no existe en esta versión de Next.js (16.2.6) — la API correcta es `permanentRedirect()` importada desde `next/navigation`
- Build: `Compiled successfully in 18.0s`, TypeScript OK, **1109 páginas**, `ƒ /property/[id]` aparece como ruta dinámica ✓
- Total `permanent: true` en next.config.ts: **15** (1 www + 2 español + 12 inglés)

**Archivos tocados:**
- MODIFIED: `next.config.ts` (12 redirects inglés agregados)
- CREATED: `src/app/property/[id]/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Commit + push → deploy Vercel
2. Smoke test en producción: `/contact`, `/sell`, `/properties` → deben redirigir a sus equivalentes en español
3. Para testear `/property/[uuid]`: obtener un UUID real de la tabla `properties` en Supabase y verificar que redirige al slug correcto

---

### Sesión 2026-05-14 — fix favicon duplicado: borrado src/app/favicon.ico

**Contexto:** El HTML de producción tenía 3 `link rel="icon"` tags en conflicto. El problema era `src/app/favicon.ico` (25 KB, versión vieja del logo completo con texto) que Next.js procesaba como metadata file y emitía con hash (`favicon.ico?favicon.0x3dzn~oxb6tn.ico` con `sizes="256x256"`), sobreescribiendo el `icon.png` correcto.

**Trabajo hecho:**
- `git rm src/app/favicon.ico` — eliminado el archivo residual de 25 KB
- Build limpio: `Compiled successfully in 18.0s`, TypeScript OK, **1109 páginas** (−1 respecto al anterior, ya que Next.js ya no registra `/favicon.ico` como ruta metadata propia)
- Build output confirma que **ya no aparece ninguna ruta `/favicon.ico` con hash** — solo `○ /icon.png` y `○ /opengraph-image.png` ✓

**Estado final:**
- `src/app/favicon.ico` → ❌ eliminado
- `public/favicon.ico` (10 KB, versión correcta) → ✅ sigue activo para compatibilidad legacy
- `src/app/icon.png` (113 KB) → ✅ favicon moderno, sirve como `○ /icon.png`

**Archivos tocados:**
- DELETED: `src/app/favicon.ico`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Iván verifica en el navegador que el favicon del tab muestra el logo correcto (después del deploy)
2. Commit: `git rm src/app/favicon.ico` + `DAILY_LOG.md` → push

---

### Sesión 2026-05-13 — assets de marca temporales: icon.png, opengraph-image.png, favicon.ico

**Contexto:** Iván generó los assets de marca a partir del logo existente de Assets Golden con la marca de Gemini AI removida. Hay que colocarlos en las ubicaciones que Next.js convention espera para que el favicon y el OG preview funcionen.

**Trabajo hecho:**
- `src/app/icon.png` (112 KB, 512×512) colocado por Iván — Next.js lo sirve automáticamente como `/icon.png`
- `src/app/opengraph-image.png` (111 KB, 1200×630) colocado por Iván — Next.js lo sirve como `/opengraph-image.png`
- `public/favicon.ico` (3 KB) colocado por Iván — compatibilidad con crawlers y browsers legacy
- Build: `Compiled successfully in 17.8s`, TypeScript OK, **1110 páginas** (2 más que antes: Next.js registró `/icon.png` y `/opengraph-image.png` como rutas estáticas propias ✓)
- layout.tsx ya tenía las referencias correctas desde commit `06f02c4` — sin cambios en código

**Verificaciones:**
- `src/app/icon.png` → ✅ 112683 bytes
- `src/app/opengraph-image.png` → ✅ 113520 bytes
- `public/favicon.ico` → ✅ 3058 bytes
- Build output muestra `○ /icon.png` y `○ /opengraph-image.png` como rutas estáticas ✓
- 4 matches de referencias en layout.tsx (líneas 30, 32, 45, 58) ✓

**Archivos tocados:**
- CREATED: `src/app/icon.png`
- CREATED: `src/app/opengraph-image.png`
- CREATED: `public/favicon.ico`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Nota:** Assets son temporales (logo limpiado de marca Gemini). Pendiente logo profesional cuando Atilio lo provea — reemplazar los mismos 3 archivos cuando llegue.

**Commits:** NO — validación visual de Iván antes de commit (verificar favicon en browser y OG preview en WhatsApp/Slack).

**Próximo paso sugerido:**
1. Iván abre `http://localhost:3000` en dev server y verifica que el favicon del tab muestra el logo de Assets Golden (no el de Vercel)
2. Iván comparte un link en WhatsApp o usa `https://opengraph.xyz` para verificar el preview 1200×630
3. Si OK: commit los 3 archivos binarios + DAILY_LOG → push → deploy Vercel
4. **Pendiente futuro**: cuando Atilio provea el logo profesional definitivo, reemplazar `src/app/icon.png`, `src/app/opengraph-image.png` y `public/favicon.ico`

---

### Sesión 2026-05-13 — redirects 301 slugs Lovable + metadata OG/Twitter + sitemap completo

**Contexto:** Google tenía indexados 3 slugs de Lovable que daban 404 en la nueva web. Además, layout.tsx no tenía openGraph/twitter configurados (causa del preview Vercel al compartir links). Sitemap tenía 8 rutas del proyecto sin incluir.

**Trabajo hecho:**
- `next.config.ts`: agregados 3 redirects a la sección `redirects()` existente (junto al www→non-www):
  - `/oportunidades-de-inversion` → `/inversiones` (301 permanente)
  - `/quiero-vender-mi-propiedad` → `/vender-tu-piso` (301 permanente)
  - `/whatsapp` → `/` (302 temporal, por si se crea la ruta en el futuro)
- `src/app/layout.tsx`: agregados `icons`, `openGraph`, `twitter` y `robots` al objeto `metadata`. Los assets (`/icon.png`, `/favicon.ico`, `/apple-icon.png`, `/opengraph-image.png`) aún no existen — se crean en sesión separada cuando Iván tenga los assets de marca; Next.js los ignora silenciosamente hasta entonces.
- `src/app/sitemap.ts`: agregadas 8 rutas faltantes a `STATIC_PAGES`: `/sobre-nosotros` (0.8), `/servicios` (0.8), `/colabora` (0.6), `/mi-demanda` (0.7), `/promociones` (0.5), `/partners` (0.5), `/consejos` (0.4), `/noticias` (0.4)
- Build: `Compiled successfully in 17.7s`, TypeScript OK, 1108 páginas ✓

**Verificaciones:**
- 3 matches de slugs Lovable en next.config.ts (líneas 134, 139, 144) ✓
- 3 matches de openGraph/twitter/icons en layout.tsx (líneas 29, 35, 53) ✓
- 3+ matches de rutas nuevas en sitemap.ts ✓

**Archivos tocados:**
- MODIFIED: `next.config.ts` (3 redirects agregados)
- MODIFIED: `src/app/layout.tsx` (icons + openGraph + twitter + robots)
- MODIFIED: `src/app/sitemap.ts` (8 rutas nuevas)
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Iván valida en dev server: `/oportunidades-de-inversion` → redirige a `/inversiones`, etc.
2. Compartir link en WhatsApp/Slack para confirmar que ya no aparece favicon Vercel (requiere deploy + assets de imagen)
3. **Pendiente separado**: crear `src/app/icon.png` (512×512) y `src/app/opengraph-image.png` (1200×630) con assets de marca de Iván → eso cierra el problema visual del favicon y OG preview
4. Si OK: commit + push

---

### Sesión 2026-05-13 — fix paginador /propiedades (reemplazo 'pagina' → 'page')

**Contexto:** El paginador de /propiedades no funcionaba: los números y "Siguiente" no cambiaban la página. Diagnóstico: `PaginationBar` siempre genera `?page=N` (inglés), pero `propiedades/page.tsx` leía `params.pagina` (español) → la página recibía `undefined` y volvía siempre a página 1. `/destinos/[slug]` leía `sp.page` → funcionaba correctamente.

**Trabajo hecho:**
- 3 cambios en `src/app/(public)/propiedades/page.tsx`:
  1. Interface `Props.searchParams`: `pagina?: string` → `page?: string` (línea 36)
  2. Read del param: `params.pagina ?? '1'` → `params.page ?? '1'` (línea 45)
  3. Llamada a `PaginationBar`: `currentParams={{ ...pageParams, pagina: undefined }}` → `currentParams={pageParams}` (línea 188)
- Verificación post-cambio: 0 matches de `pagina` en el archivo ✓
- Build: `Compiled successfully in 17.0s`, TypeScript OK, 1108 páginas ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/propiedades/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual de Iván antes de commit.

**Próximo paso sugerido:**
1. Iván abre `/propiedades` en dev server y verifica que los botones del paginador navegan correctamente entre páginas
2. Verificar también `/inversiones` (usa el mismo `PaginationBar` — confirmar que NO tiene el mismo bug de `pagina` vs `page`)
3. Si OK: commit + push

---

### Sesión 2026-05-12 — placeholders legales reemplazados (excepto Tomo Registro Mercantil)

**Contexto:** Atilio confirmó los datos legales reales. Reemplazar todos los `[PLACEHOLDER: …]` en las 3 páginas legales por los valores definitivos.

**Trabajo hecho:**
- Reemplazados 7 tipos de placeholder en `politica-de-privacidad`, `aviso-legal` y `politica-de-cookies`:
  - RAZÓN_SOCIAL → `COVA FUMADA GROUP S.L.` (3 ocurrencias en privacidad, 3 en aviso-legal, 1 en cookies)
  - CIF_NIF → `B05380886`
  - DOMICILIO_FISCAL → `José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)`
  - REGISTRO_MERCANTIL → `Inscrita en el Registro Mercantil de Barcelona, Tomo [TOMO_PENDIENTE: confirmar con Atilio], Folio 1, Hoja B-562057, Inscripción 2`
  - TELEFONO → `+34 611 85 30 01`
  - EMAIL_CONTACTO → `hola@assetsgolden.com`
  - EMAIL_DERECHOS_GDPR → `admin@assetsgolden.com` (3 ocurrencias en privacidad, 1 en aviso-legal, 1 en cookies)
  - JURISDICCION → `Barcelona`
- Grep de verificación: 0 matches de cualquier placeholder original ✓
- Único `[TOMO_PENDIENTE: confirmar con Atilio]` queda en 2 archivos (privacidad:38, aviso-legal:38) hasta confirmación
- Build: `Compiled successfully in 19.4s` ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/politica-de-privacidad/page.tsx`
- MODIFIED: `src/app/(public)/aviso-legal/page.tsx`
- MODIFIED: `src/app/(public)/politica-de-cookies/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** NO — validación visual antes de commit.

**Próximo paso sugerido:**
1. Iván abre las 3 páginas en dev server y verifica visualmente que los datos legales aparecen correctamente
2. Confirmar con Atilio el Tomo del Registro Mercantil de Barcelona → reemplazar el único `[TOMO_PENDIENTE]` que queda
3. Una vez verificado: commit + push

---

### Sesión 2026-05-10 — resumen del día (sesiones 1-9 + housekeeping)

**Resumen ejecutivo de todo el 2026-05-10:**

| Commit | Sesión | Qué |
|---|---|---|
| `43142d2` | s6 | Security patch Next.js 16.2.6 + React 19.2.6 |
| `454f638` | s7 | BotID Basic en 3 endpoints + 1 server action |
| `4c5134a` | s8 | Fix extractor HabiHub — dedup URLs fotos |
| `03f1e70` | s9 | Fotos múltiples: público sin límite, create form, ⭐ Principal |

**También hoy (sin commit de código, operaciones MCP/datos):**
- Dedup retroactivo de fotos: 48 propiedades, 176 URLs duplicadas
  eliminadas vía SQL en producción (backup en
  `gallery_urls_backup_dedup_20260510` — borrar en 1-2 semanas)
- `.gitignore` actualizado para excluir `outputs/inventario-servicios.md`

**Commits anteriores referenciados en el day-log:**
- `adbb6fc` — páginas legales GDPR (sesión 3, 2026-05-06)
- `b324d1d` — audit log admin (sesión 4, 2026-05-10)
- `e9e0ca7` — filtro destacadas con conteo en tabs (sesión 5, 2026-05-10)

**Próximo paso sugerido:**
Esperando respuesta de Atilio en 6 puntos pendientes:
1. Acceso Resend → desbloquea refactor pipeline de leads (bloqueante go-live)
2. Datos legales reales (CIF, domicilio, etc.) → reemplazar PLACEHOLDERs
3. DNS → conectar assetsgolden.com
4. Decisión titularidad infra (IBott vs Assets Golden)
5. SA Google sheets — ¿compartida con n8n/agencia? → decide cómo rotar
6. DPAs: aceptar en Supabase, Vercel, Cloudflare, Google, Resend, Upstash

Mientras tanto, pendientes atacables independientes de Atilio:
- Aviso GDPR en formularios `/contacto` y `/mi-demanda`
- Refactor `<PropertyGalleryUpload />` (componente compartido create/edit)
- Lint: `react-hooks/set-state-in-effect` en `PortalPropertiesGrid.tsx:341`
- Actualizar `fast-xml-parser` a `^5.7.0` (vuln MODERATE)

---

### Sesión 2026-05-10 — sesión 9 (fotos propiedades: mostrar todas, galería en create, imagen principal elegible)

**Contexto:** Después del dedup retroactivo (sesión 8) y el fix del
extractor HabiHub, quedan 3 problemas de fotos: (1) público truncaba a
6, (2) create form solo permitía 1 foto, (3) no había UI para elegir
imagen principal.

**Trabajo hecho:**

*Display público (trivial):*
- `src/app/(public)/propiedades/[slug]/page.tsx:68` → eliminado
  `.slice(0, 6)`. Ahora se muestran todas las fotos (promedio ~24 por
  propiedad). El JSON-LD schema también incluye todas.
- `src/components/portal/PortalPropertyDetail.tsx:31` → eliminado
  `.slice(0, 10)`. Portal agente muestra galería completa.

*Create form — galería completa (mediano):*
- `src/app/admin/nueva-propiedad/page.tsx` reescrito. Reemplazado el
  input simple de 1 foto por UI de galería completa:
  - Estado `galleryFiles: File[]` + `galleryPreviews: string[]`
  - Límite de `MAX_PHOTOS = 12` con alert si se excede
  - Grid 4 columnas con thumbnails, badge "Principal" en i=0,
    botón ⭐ "Principal" en i≠0, botón × para eliminar
  - Upload secuencial a `/api/admin/upload-image`
  - Envía `image_url: uploadedUrls[0]` y `gallery_urls: uploadedUrls`
  - `URL.revokeObjectURL()` en `removePhoto` para evitar memory leaks
- `src/app/api/admin/create-property/route.ts`: agregado `gallery_urls`
  al INSERT con dedup server-side (`[...new Set(...)]` + filtro HTTP)

*Botón "Hacer principal" — edit form (mediano):*
- `src/app/admin/propiedades/[id]/edit/page.tsx`: agregada función
  `makeMainImage(i)` que mueve el item al índice 0 del array en memoria.
  Badge "Principal" (i=0) ya existía — se mueve automáticamente.
  Botón ⭐ "Principal" visible en cada thumbnail con i≠0.

**Decisión DRY:** La UI de galería NO se extrajo a un componente
compartido `<PropertyGalleryUpload />` — copy-paste entre create y edit
por simplicidad (extracción estimada en +30-45 min extra). Anotado como
pendiente de refactor en limpieza técnica.

**Build:** `Compiled successfully in 16.5s`, TypeScript OK, 1108 páginas

**Verificaciones:**
- `.slice(0, 6)` en src → 0 matches ✓
- `.slice(0, 10)` en portal → 0 matches ✓
- `makeMainImage` definida (l.124) y usada (l.232) en edit ✓
- `gallery_urls` en create-property endpoint (l.64-65) ✓

**Archivos tocados:**
- MODIFIED: `src/app/(public)/propiedades/[slug]/page.tsx`
- MODIFIED: `src/components/portal/PortalPropertyDetail.tsx`
- MODIFIED: `src/app/admin/nueva-propiedad/page.tsx` (reescrito)
- MODIFIED: `src/app/api/admin/create-property/route.ts`
- MODIFIED: `src/app/admin/propiedades/[id]/edit/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente validación visual.

**Próximo paso sugerido:**
1. Iván abre `/admin/nueva-propiedad` y prueba subir varias fotos,
   cambiar la principal, eliminar alguna, y crear la propiedad
2. Iván abre `/admin/propiedades/[id]/edit` en una propiedad con fotos
   y prueba el botón ⭐ Principal
3. Verificar que la galería pública de esa propiedad muestra todas las
   fotos (antes 6, ahora sin límite)
4. Si OK: commit + push

---

### Sesión 2026-05-10 — sesión 8 (fix extractor HabiHub — dedup URLs de fotos)

**Contexto:** Después del último sync se encontraron 48 propiedades (2%
del total) con URLs duplicadas en `gallery_urls`. Iván ejecutó SQL directo
en producción para limpiarlas (176 duplicados eliminados — no hay commit,
fue operación MCP directa). El bug estaba en el extractor del sync: el
array de imágenes del XML de HabiHub se asignaba sin deduplicar.

**Diagnóstico:** En `parseFeedProp()` (sync-habihub/route.ts), el array
`images` se construía con `.filter(url => url.length > 0 && url.startsWith('http'))`
pero sin eliminar repetidos. Luego se asignaba directo a `gallery_urls: images`.
El feed de HabiHub incluye URLs duplicadas en algunas propiedades, y sin
dedup en el extractor, cada sync lunes 03:00 UTC reintroducía los duplicados.

**Trabajo hecho:**
- Añadida función `dedupeImageUrls(urls: string[]): string[]` justo antes
  de `parseFeedProp` (línea 122). Preserva orden original (primera ocurrencia
  gana, usando Set + loop en lugar de `[...new Set()]` para control explícito
  de orden y filtrado de vacíos)
- En `parseFeedProp`: `const deduped = dedupeImageUrls(images)` antes del
  return; ambos campos ahora usan el array limpio:
  `image_url: deduped[0] ?? null` y `gallery_urls: deduped`
- Build limpio: `Compiled successfully in 17.1s`, TypeScript OK, 1108 páginas

**Nota operativa:** El SQL de dedup retroactivo (48 props, 176 fotos) fue
ejecutado por Iván desde Supabase MCP en sesión anterior — sin commit en el
repo, es una operación de datos, no de código.

**No hay tests del sync** — el extractor no tiene test suite propia. Para
validar habría que ejecutar el sync manual desde `/admin/sync` en staging/prod
y verificar que las propiedades previamente afectadas no vuelvan a tener
duplicados. Recomendable hacer la comprobación el próximo lunes tras el cron.

**Archivos tocados:**
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts` (+12 líneas: helper + 2 cambios)
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación.

**Próximo paso sugerido:**
1. Iván valida el diff y autoriza commit
2. Verificar post-cron del lunes 13/05: que las 48 propiedades no vuelvan
   a tener duplicados en `gallery_urls`
3. Decidir si se ataca el límite de 6 fotos en la galería pública
   (`/propiedades/[slug]/page.tsx:68` → `.slice(0, 6)`) — trivial

---

### Sesión 2026-05-10 — sesión 7 (BotID Basic en formularios públicos)

**Contexto:** Implementar protección anti-bots en los 7 formularios
públicos. Decisión arquitectural: BotID Basic (Vercel-native, gratis,
sin env vars) en lugar de Cloudflare Turnstile (más integrado al stack).

**Trabajo hecho:**
- `npm install botid` → `botid@1.5.11` (1 package added, 723 auditados)
- `next.config.ts`: wrapeado con `withBotId()` de `botid/next/config`
- Creado `src/instrumentation-client.ts` con `initBotId()` protegiendo
  3 paths: `/api/leads`, `/api/demands`, `/api/collaborations` (POST)
- `src/app/api/leads/route.ts`: `checkBotId()` al inicio del try,
  antes de parsear el body → 403 si isBot
- `src/app/api/demands/route.ts`: mismo patrón
- `src/app/api/collaborations/route.ts`: mismo patrón
- `src/app/(public)/vender-tu-piso/actions.ts`: `checkBotId()` al
  inicio del server action, antes de cualquier validación →
  return ActionState con error si isBot
- Build limpio: `Compiled successfully in 18.0s`, TypeScript OK,
  1108 páginas estáticas (mismo count que sesión 6)

**Verificaciones:**
- `checkBotId` en 4 archivos (import + call en cada uno) ✓
- `initBotId` en `src/instrumentation-client.ts` (import + call) ✓
- `withBotId` en `next.config.ts` (import + export) ✓

**Nota arquitectural:** Las server actions no se protegen con
`protect[]` de `initBotId` (URL generada por Next.js); su protección
es directamente en el código del action con `checkBotId()` server-side.
El plan Basic no requiere upgrade — está incluido en cualquier plan Vercel.

**Archivos tocados:**
- MODIFIED: `package.json` (botid añadido)
- MODIFIED: `package-lock.json`
- MODIFIED: `next.config.ts` (import withBotId + wrap export)
- CREATED: `src/instrumentation-client.ts`
- MODIFIED: `src/app/api/leads/route.ts`
- MODIFIED: `src/app/api/demands/route.ts`
- MODIFIED: `src/app/api/collaborations/route.ts`
- MODIFIED: `src/app/(public)/vender-tu-piso/actions.ts`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual.

**Próximo paso sugerido:**
1. Iván confirma que el build es el esperado y autoriza commit
2. Próximo bloqueante go-live independiente de Atilio:
   - Aviso GDPR en formularios `/contacto` y `/mi-demanda`
   - DNS (depende Atilio)
3. Pendiente que depende de Atilio: Resend access → refactor pipeline leads
4. Opcional (si se quiere pasar a BotID Pro): upgrade plan Vercel para
   analytics de detección de bots

---

### Sesión 2026-05-10 — sesión 6 (security patch Next.js + React)

**Contexto:** Vulnerabilidades de seguridad de mayo 2026 (auth bypass
via segment-prefetch URL, dynamic route parameter injection). Diagnóstico
previo confirmó patch update (no major/minor), riesgo mínimo.

**Trabajo hecho:**
- Aplicado `npm install next@16.2.6 react@19.2.6 react-dom@19.2.6 eslint-config-next@16.2.6`
  (7 packages changed, 722 auditados)
- Build limpio post-update: `Compiled successfully in 16.6s`, TypeScript OK,
  1108 páginas estáticas generadas (mismo count que antes del patch)
- Lint: 27 problemas (9 errores, 18 warnings) — todos pre-existentes EXCEPTO
  posiblemente los 2 errores `react-hooks/set-state-in-effect` (nueva regla
  habilitada en eslint-config-next@16.2.6, ver hallazgos)
- Diff stat verificado: solo `package.json` y `package-lock.json` modificados
  en esta sesión (src/ intacto)

**Hallazgos del `npm audit` (9 vulnerabilidades, NINGUNA introducida por
este patch — son transitorias pre-existentes):**
- `fast-xml-parser@5.5.12` (dep directa) — MODERATE, vulnerable <5.7.0.
  **ACCIONABLE:** actualizar a `^5.7.0`. Agregado a pendientes.
- `postcss` via next@16.2.6 — el fix requeriría next@9.3.3 (downgrade
  catastrófico). Es un falso positivo del npm audit. NO correr
  `npm audit fix --force`. Bloqueado hasta que Vercel publique next@16.3.0+.
- `hono@4.12.12`, `express-rate-limit@8.3.2`, `ip-address` — transitivas
  vía `shadcn → @modelcontextprotocol/sdk`. No accionable sin actualizar shadcn.
- `basic-ftp`, `fast-uri` — origen probable puppeteer/googleapis. No accionable.

**Errores lint potencialmente nuevos** (habilitados por eslint-config-next@16.2.6):
- `react-hooks/set-state-in-effect` en `src/app/admin/nueva-propiedad/page.tsx:34`
  y `src/components/portal/PortalPropertiesGrid.tsx:341`. No son bugs críticos
  pero sí anti-patrón en React 19. Agregado a pendientes limpieza técnica.

**Archivos tocados:**
- MODIFIED: `package.json` (4 versiones bumpeadas)
- MODIFIED: `package-lock.json` (7 packages actualizados)
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual.

**Próximo paso sugerido:**
1. Iván confirma que el build/lint es el esperado y autoriza commit
2. Resolver `fast-xml-parser` (`npm install fast-xml-parser@^5.7.0`) en la
   misma sesión o en una siguiente
3. Atacar `react-hooks/set-state-in-effect` como limpieza técnica menor
4. Próximo bloqueante go-live: Captcha Cloudflare Turnstile

---

### Sesión 2026-05-10 — sesión 5 (filtro destacadas admin — conteos en tabs)

**Contexto:** Iván pidió que Atilio pueda ver rápido las propiedades
con `featured=true` desde `/admin/propiedades`. Al explorar el código
se detectó que el tab "Destacadas" ya existía; lo que faltaba eran los
**conteos numéricos** en los tabs ("Todas (N)" / "Destacadas (N)").

**Trabajo hecho:**
- Eliminada la constante estática `TABS` del módulo; movida dentro
  del server component para poder inyectar counts dinámicos
- Agregadas 2 queries HEAD en paralelo al `Promise.all` existente:
  count total del catálogo (sin filtros) y count solo `featured=true`
- Los tabs "Todas" y "Destacadas" ahora muestran el conteo entre
  paréntesis con `toLocaleString('es-ES')`; los demás tabs sin count
- TypeScript: la guarda inicial `'count' in tab` no estrechaba el tipo
  cuando la propiedad es opcional; corregida a `tab.count !== undefined`
- Build limpio: `Compiled successfully` + todas las páginas estáticas
  generadas sin errores

**Patrón elegido:** Opción A (URL query param, `?filter=featured`).
Era el patrón ya existente en la página; sin cambios al cliente ni
al componente `PropiedadesTable`.

**Archivos tocados:**
- MODIFIED: `src/app/admin/propiedades/page.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual.

**Próximo paso sugerido:**
1. Iván valida visualmente que los tabs muestran los conteos correctos
   y que el tab "Destacadas" filtra bien
2. Una vez validado: commit + push (junto con sesión 4 si aún no se
   hizo)
3. Próximos pendientes bloqueantes go-live:
   - Captcha Cloudflare Turnstile (mayor prioridad)
   - Refactor pipeline leads cuando llegue acceso Resend de Atilio

---

### Sesión 2026-05-10 — sesión 4 (audit log admin)

**Contexto:** Iván pidió implementar un sistema de audit log para rastrear
cambios críticos de admins: tabla Supabase, helper reutilizable, aplicación
en server actions + endpoints críticos, y página `/admin/audit`.

**Trabajo hecho:**
- Migración `20260510000001_create_admin_audit_log.sql` creada en repo y
  aplicada vía Supabase MCP (tabla + 3 índices + RLS). Confirmada por Iván
  antes de proceder
- Creado `src/lib/audit.ts` con `logAdminAction()` best-effort: actor
  opcional (evita doble getUser), import estático de createClient,
  nullish coalescing consistente
- Modificado `src/app/admin/actions.ts`: 14 funciones ahora llaman
  `logAdminAction` — toggleFeatured, togglePropertyVisibility, deleteProperty,
  bulkDeleteProperties, createProperty, togglePropertySold, bulkMarkAsSold,
  deleteLead, createBlogPost, updateBlogPost, deleteBlogPost, createTeamMember,
  updateTeamMember, deleteTeamMember. Para deletes: fetch previo del label.
  Para creates: `.select('id').single()` para capturar el ID generado
- Modificados 6 endpoints API: create/update/delete/toggle-agent,
  send-password-reset, sync-habihub (condición `!isCronAuth`; pasa `actor`
  desde el user ya disponible en el route handler para evitar tercer getUser)
- Creada página `src/app/admin/audit/page.tsx`: tabla paginada (50/página),
  filtros GET por actor/action/entity_type, badges de color por tipo de acción,
  metadata collapsable vía `<details>`, paginación por URL params, enlace
  "Limpiar" cuando hay filtros activos
- Modificado `AdminSidebar.tsx`: agregado enlace "Auditoría" con icono
  ClipboardList antes de Ajustes

**Nota técnica:** `updateProperty` del spec original no existe como server
action en `actions.ts` — es el route handler `/api/admin/update-property/`.
No fue incluido en este scope (no estaba en PASO 6). Puede auditarse en
sesión futura si se prioriza.

**Archivos tocados:**
- CREATED: `supabase/migrations/20260510000001_create_admin_audit_log.sql`
- CREATED: `src/lib/audit.ts`
- CREATED: `src/app/admin/audit/page.tsx`
- MODIFIED: `src/app/admin/actions.ts` (14 funciones + import audit)
- MODIFIED: `src/app/api/admin/create-agent/route.ts`
- MODIFIED: `src/app/api/admin/update-agent/route.ts`
- MODIFIED: `src/app/api/admin/delete-agent/route.ts`
- MODIFIED: `src/app/api/admin/toggle-agent/route.ts`
- MODIFIED: `src/app/api/admin/send-password-reset/route.ts`
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`
- MODIFIED: `src/components/admin/AdminSidebar.tsx`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de validación visual del usuario.

**Próximo paso sugerido:**
1. Iván valida visualmente `/admin/audit` y confirma que las acciones se
   loguean correctamente (hacer una operación de prueba y verificar la fila)
2. Una vez validado: commit + push
3. Próximos pendientes a atacar (en orden sugerido):
   - Captcha Cloudflare Turnstile en formularios (bloqueante go-live)
   - Refactor pipeline de leads cuando llegue acceso Resend de Atilio
   - Migración de 166 imágenes legacy de Lovable (no depende de Resend)

---

### Sesión 2026-05-06 — sesión 3 (páginas legales GDPR — borradores)

**Contexto:** Iván pidió crear las páginas legales GDPR-compliant
requeridas antes del go-live: política de privacidad, aviso legal y
política de cookies. Banner de cookies + checkbox GDPR queda fuera
de esta sesión (depende de captcha + refactor de leads).

**Trabajo hecho:**
- Detectado en PASO 1 que `/politica-de-privacidad` ya existía
  (legacy de Lovable, 10 secciones razonables pero con datos
  hardcoded y secciones faltantes); decidida con el usuario la
  Opción B (ampliar manteniendo estructura)
- Reescrita `/politica-de-privacidad` con secciones añadidas:
  identidad completa (CIF, registro mercantil), transferencias
  internacionales (EU-US DPF + SCCs), lista completa de proveedores
  (Supabase, Vercel, Cloudflare, Resend, Google, Upstash), referencias
  a artículos del RGPD (15-22), citas a LOPDGDD y LSSI-CE
- Convertidos a `[PLACEHOLDER: …]` todos los datos hardcoded
  (razón social, CIF, domicilio, registro mercantil, teléfono,
  emails, jurisdicción) con sufijo del valor sospechado y nota
  para confirmación con Atilio
- Creada `/aviso-legal` desde cero con 10 secciones LSSI-CE Art. 10:
  identificación del prestador, objeto y aceptación, condiciones
  de uso, propiedad intelectual, información sobre los inmuebles
  (no constituye oferta contractual), limitación de responsabilidad,
  comunicaciones electrónicas, protección de datos, modificaciones,
  legislación aplicable y jurisdicción
- Creada `/politica-de-cookies` desde cero con 8 secciones según
  guía AEPD: definición, tipos (técnicas estrictamente necesarias
  con tabla detallada de cookies Supabase/Cloudflare/Vercel,
  analíticas previstas con GA4, publicitarias previstas con Meta
  Pixel/Google Ads), base jurídica, gestión y revocación con
  enlaces a navegadores, transferencias internacionales,
  retención (24 meses AEPD), modificaciones
- Footer (`src/components/Footer.tsx`): agregados enlaces a
  `/aviso-legal` y `/politica-de-cookies` junto al ya existente de
  privacidad en el bottom-bar; ajustado layout para que envuelva en
  móvil
- Sitemap (`src/app/sitemap.ts`): añadidas las 3 rutas con
  `priority: 0.3` y `changeFrequency: 'yearly'`
- Build limpio: `Compiled successfully` + `Finished TypeScript`,
  las 3 rutas legales aparecen como `○ (Static)`

**Archivos tocados:**
- MODIFIED: `src/app/(public)/politica-de-privacidad/page.tsx`
  (reescrita, v1.0 → v2.0)
- CREATED: `src/app/(public)/aviso-legal/page.tsx`
- CREATED: `src/app/(public)/politica-de-cookies/page.tsx`
- MODIFIED: `src/components/Footer.tsx`
- MODIFIED: `src/app/sitemap.ts`
- MODIFIED: `DAILY_LOG.md` (esta entrada + nuevo pendiente Atilio)

**Commits:** ninguno todavía — pendiente de validación visual del
usuario.

**Próximo paso sugerido:**
1. Iván abre las 3 páginas en el dev server y revisa visualmente
   (espaciado, jerarquía, tabla de cookies en mobile).
2. Una vez validado: commit + push.
3. Después atacar uno de los siguientes pendientes activos:
   - **Banner de cookies + GDPR checkbox** en formularios
     (pareja natural: aprovechar para integrar Cloudflare Turnstile
     en los 3 endpoints + 1 server action que ya están como
     bloqueante go-live)
   - O esperar acceso Resend de Atilio para refactor pipeline leads
4. Cuando Atilio tenga lista la documentación legal real (CIF,
   registro mercantil, dirección completa, emails de privacidad),
   reemplazar los `[PLACEHOLDER: …]` en las 3 páginas + bottom-bar
   del footer si la razón social difiere de "CFG Global Investment S.L.".

---

### Sesión 2026-05-06 — sesión 2 (auditoría de claves + plan de rotación)

**Contexto:** Iván pidió un diagnóstico completo del estado de
secretos del proyecto antes de ejecutar la rotación pendiente. Solo
lectura — sin modificaciones, sin rotación.

**Trabajo hecho:**
- Verificado historial git completo (`--all --full-history`) para
  `.env`, `.env.local`, `.env.development`, `.env.production` y
  variantes `.bak/.old/.backup`: ninguno commiteado nunca
- Auditado `.gitignore`: cubre `.env*` y `*.pem`; falta `*.key`
  (recomendación menor, no bloqueante)
- Búsqueda exhaustiva de secretos hardcoded en src/scripts/supabase
  (patrones JWT Supabase, Stripe, OAuth, AWS, PRIVATE KEY,
  literales API_KEY/SECRET/TOKEN): **0 matches críticos**, todo
  pasa por `process.env.X`
- Mapeados los 16 archivos que consumen `SUPABASE_SERVICE_ROLE_KEY`
  (6 runtime + 10 scripts CLI) y los 2 que consumen
  `GOOGLE_SHEETS_CREDENTIALS_JSON`
- Inventariadas 16 env vars del proyecto, clasificadas en
  pública/sensible/config
- Plan de rotación documentado para ambas claves con orden, smoke
  tests, rollback y blockers identificados
- Hallazgos menores anotados: `test-sheets/route.ts` logea
  Sheet ID completo en Vercel logs; `debug-env/route.ts` existió
  en historia (sin leak real, ya removido); SA Google compartida
  con proyecto agencia (relevante para Opción A vs B)

**Severidad global del audit:** 🟢 BAJA — no hay exposición real, la
rotación es preventiva.

**Archivos tocados:**
- CREATED: `outputs/security-audit-2026-05-06.md`
- MODIFIED: `DAILY_LOG.md` (esta entrada)

**Commits:** ninguno todavía — pendiente de OK del usuario.

**Próximo paso sugerido:**
1. Iván revisa `outputs/security-audit-2026-05-06.md`.
2. Confirmar antes de rotar:
   - Titularidad/acceso al Supabase Dashboard `mromkwpqrxpxbbxhdofs`
   - Titularidad/acceso a GCP Console `agencia-automatizacion-490823`
   - Si la SA `assets-golden-sheets@…` se comparte con n8n/agencia
     (decide Opción A vs B para rotar Sheets)
3. Coordinar ventana de mantenimiento (~15 min) en horario bajo-tráfico
4. Ejecutar rotación: primero `SUPABASE_SERVICE_ROLE_KEY`, después
   `GOOGLE_SHEETS_CREDENTIALS_JSON`. Opcionalmente aprovechar para
   rotar también `CRON_SECRET`, `RESEND_API_KEY`,
   `UPSTASH_REDIS_REST_TOKEN`.

---

### Sesión 2026-05-06 (cleanup técnico + sistema DAILY_LOG)

**Contexto:** sesión de limpieza menor + introducción del sistema DAILY_LOG.

**Trabajo hecho:**
- Borradas carpetas vacías `src/app/admin/destinos/` y `src/app/api/admin/update-destino/`
- Eliminada variable zombie `conflictIds` del sync HabiHub (era Set sin .add())
- Removido `api.anthropic.com` del CSP de next.config.ts (no se usaba)
- Verificado bucket `team-photos` en Supabase (existe y está OK)
- Creado este DAILY_LOG.md con el sistema de bitácora

**Archivos tocados:**
- DELETED: `src/app/admin/destinos/`, `src/app/api/admin/update-destino/`
- MODIFIED: `src/app/api/admin/sync-habihub/route.ts`, `next.config.ts`, `CLAUDE.md`
- CREATED: `DAILY_LOG.md`

**Commits:**
- `e73892a` — chore(cleanup): borrar carpetas vacías + variable zombie + CSP unused
- `4cd32b4` — feat(devx): sistema DAILY_LOG.md para bitácora entre sesiones

**Próximo paso sugerido:** Esperar acceso a Resend de Atilio para hacer
el refactor del pipeline de leads. Mientras tanto, atacar item de
pendientes activos (auditoría de claves o páginas legales GDPR).

---

*Última edición automática por Claude Code: 2026-05-10 (cierre del día)*
