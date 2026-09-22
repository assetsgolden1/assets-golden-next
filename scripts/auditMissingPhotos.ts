/**
 * Audita qué propiedades visibles (y equipo/blog/destinos) tienen fotos rotas tras la
 * reconstrucción del 22/09/2026: comprueba con HEAD cada image_url del proyecto y
 * emite un informe Markdown + JSON. No modifica nada. OJO: un HEAD fallido puede ser un 500 transitorio
 * de Storage (pasa cuando el backup semanal descarga 4 GB); no tomar decisiones destructivas a partir de este informe.
 *
 * Uso: npx tsx --env-file=.env.local scripts/auditMissingPhotos.ts <salida.md>
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
const sb = createClient(URL_, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const OUT = process.argv[2] ?? 'docs/fotos-pendientes.md'
// Comprobación contra el LISTADO real de Storage (fuente de verdad). Antes se hacía con HEAD por URL,
// pero Storage devuelve 500 transitorios bajo carga (p. ej. durante el backup semanal) y daba falsos negativos.
const PUB = `${URL_}/storage/v1/object/public/`
const objects = new Map<string, Set<string>>()   // bucket -> paths
async function loadBucket(bucket: string) {
  const out = new Set<string>()
  const walk = async (p: string) => { for (let off = 0; ; off += 100) { const { data, error } = await sb.storage.from(bucket).list(p, { limit: 100, offset: off, sortBy: { column: 'name', order: 'asc' } }); if (error) throw new Error(`list ${bucket}/${p}: ${error.message}`); for (const e of data ?? []) { const f = p ? `${p}/${e.name}` : e.name; if (e.id) out.add(f); else await walk(f) } if (!data || data.length < 100) break } }
  await walk(''); objects.set(bucket, out)
}
async function ok(u: string | null | undefined): Promise<boolean> {
  if (!u) return false
  if (!u.startsWith(PUB)) return true                         // CDN externo (HabiHub): no afectado
  const [bucket, ...rest] = u.slice(PUB.length).split('/')
  if (!objects.has(bucket)) await loadBucket(bucket)
  return objects.get(bucket)!.has(decodeURIComponent(rest.join('/')))
}
async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length); let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]) } }))
  return out
}

async function main() {
  const props: Record<string, unknown>[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('properties')
      .select('id,ref_code,title,slug,country,location,external_source,featured,image_url,gallery_urls,idealista_url,nestseekers_url')
      .in('status', ['active', 'available']).not('hidden', 'eq', true).not('hidden_by_sync', 'eq', true).range(from, from + 999)
    if (error) throw error
    props.push(...(data as Record<string, unknown>[]))
    if (!data || data.length < 1000) break
  }
  type P = { id: string; ref_code: string; title: string; slug: string; country: string | null; location: string | null; external_source: string | null; featured: boolean | null; image_url: string | null; gallery_urls: string[] | null; idealista_url: string | null; nestseekers_url: string | null }
  // --prune fue retirado el 22/09: podaba URLs que devolvían 500 transitorios de Storage y borró fotos reales de las galerías.
  const PRUNE = false
  const own = (props as unknown as P[]).filter((p) => String(p.image_url ?? '').includes('supabase.co') || JSON.stringify(p.gallery_urls ?? []).includes('supabase.co'))
  console.log(`visibles ${props?.length} · con fotos propias ${own.length}`)
  let pruned = 0
  const rows = await pool(own as unknown as P[], 8, async (p: P) => {
    const urls = [p.image_url, ...((p.gallery_urls as string[]) ?? [])].filter(Boolean) as string[]
    const flags = await Promise.all(urls.map(ok))
    const alive = flags.filter(Boolean).length
    // --prune: quita de la galería las URLs muertas (quedaron del proyecto borrado) para que la ficha no muestre huecos
    if (PRUNE && alive > 0 && alive < urls.length) {
      const live = urls.filter((_, i) => flags[i])
      const { error } = await sb.from('properties').update({ image_url: live[0], gallery_urls: [...new Set(live)] }).eq('id', p.id)
      if (!error) pruned++
    }
    return { ...p, total: urls.length, alive }
  })
  if (PRUNE) console.log(`galerías depuradas: ${pruned}`)
  const missing = rows.filter(r => r.alive === 0)
  const partial = rows.filter(r => r.alive > 0 && r.alive < r.total)
  const complete = rows.filter(r => r.alive === r.total)

  const { data: team } = await sb.from('team_members').select('name,member_type,linkedin_url,photo_url').eq('active', true).order('order_index')
  const teamMissing = []; for (const t of team ?? []) if (t.photo_url && !(await ok(t.photo_url))) teamMissing.push(t)
  const { data: blog } = await sb.from('blog_posts').select('slug,title,cover_image,banner_image_url').eq('published', true)
  const blogMissing = []; for (const b of blog ?? []) if ((b.cover_image && !(await ok(b.cover_image))) || (b.banner_image_url && !(await ok(b.banner_image_url)))) blogMissing.push(b)
  const { data: dest } = await sb.from('country_destinations').select('country_name,slug,hero_image_url,card_image_url,city_images').eq('active', true)
  const destMissing = []
  for (const d of dest ?? []) {
    const urls = [d.hero_image_url, d.card_image_url, ...Object.values((d.city_images as Record<string, string>) ?? {})].filter(Boolean) as string[]
    const dead = []; for (const u of urls) if (!(await ok(u))) dead.push(u)
    if (dead.length) destMissing.push({ ...d, dead: dead.length, total: urls.length })
  }

  const bySrc = (list: typeof rows) => Object.entries(list.reduce((a, r) => { a[r.external_source ?? 'manual'] = (a[r.external_source ?? 'manual'] ?? 0) + 1; return a }, {} as Record<string, number>)).map(([k, v]) => `${k} ${v}`).join(', ')
  const row = (r: (typeof rows)[number]) => `| ${r.ref_code} | ${r.featured ? '⭐' : ''} | ${r.title.replace(/\|/g, '/').slice(0, 60)} | ${[r.location, r.country].filter(Boolean).join(', ')} | ${r.external_source ?? 'manual'} | ${r.alive}/${r.total} | ${r.idealista_url ? '[idealista](' + r.idealista_url + ')' : ''} https://assetsgolden.com/propiedades/${r.slug} |`
  const head = '| Ref | Dest. | Título | Lugar | Origen | Fotos OK | Enlaces |\n|---|---|---|---|---|---|---|'
  const md = `# Fotos pendientes de recuperar — ${new Date().toISOString().slice(0, 10)}

Generado por \`scripts/auditMissingPhotos.ts\` comprobando cada URL contra el Storage del proyecto reconstruido.
Las ${props?.length} propiedades visibles menos las ${own.length} con fotos propias usan el CDN del proveedor y **no se vieron afectadas**.

## Resumen
- Propiedades con fotos propias: **${own.length}** → completas **${complete.length}**, parciales **${partial.length}**, **sin ninguna foto: ${missing.length}**
- Sin foto por origen: ${bySrc(missing) || '—'}
- Destacadas sin foto: **${missing.filter(r => r.featured).length}**
- Equipo sin foto: **${teamMissing.length}** · Blog con portada rota: **${blogMissing.length}** · Destinos con imágenes rotas: **${destMissing.length}**

## Propiedades SIN ninguna foto (${missing.length})
${head}
${missing.sort((a, b) => Number(b.featured) - Number(a.featured) || a.ref_code.localeCompare(b.ref_code)).map(row).join('\n')}

## Propiedades con galería PARCIAL (${partial.length})
${head}
${partial.map(row).join('\n')}

## Equipo sin foto (${teamMissing.length})
| Nombre | Tipo | LinkedIn |
|---|---|---|
${teamMissing.map(t => `| ${t.name} | ${t.member_type} | ${t.linkedin_url ?? '—'} |`).join('\n')}

## Blog con portada rota (${blogMissing.length})
${blogMissing.map(b => `- ${b.title} — https://assetsgolden.com/blog/${b.slug}`).join('\n')}

## Destinos con imágenes rotas (${destMissing.length})
${destMissing.map(d => `- ${d.country_name}: ${d.dead}/${d.total} rotas — https://assetsgolden.com/destinos/${d.slug}`).join('\n')}

## Información perdida (no fotos)
- Cambios hechos desde el panel entre el **5 y el 21 de septiembre**: el backup es del 5/09. El log de auditoría muestra que en ese período la actividad habitual eran destacados, ocultar/vendida y gestión de leads. Las propiedades nuevas del feed HabiHub ya se regeneraron con el sync (85 insertadas el 22/09).
- **Leads web** del 5 al 21/09 (24 filas): no están en la BD, pero **sí en el Google Sheet "Contactos Web"**.
- **Contraseñas** de los 18 usuarios (2 admins + 16 agentes): cada uno debe usar "¿Olvidaste tu contraseña?" en /admin/login o /portal/login.
`
  fs.writeFileSync(OUT, md)
  fs.writeFileSync(OUT.replace(/\.md$/, '.json'), JSON.stringify({ missing, partial, teamMissing, blogMissing, destMissing }, null, 2))
  console.log(`sin foto ${missing.length} · parciales ${partial.length} · completas ${complete.length} · equipo ${teamMissing.length} · blog ${blogMissing.length} · destinos ${destMissing.length}\n→ ${OUT}`)
}
main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
