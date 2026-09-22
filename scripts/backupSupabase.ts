/**
 * Backup completo del proyecto Supabase a disco: tablas (JSON), usuarios de Auth
 * (sin contraseñas) y TODOS los objetos de Storage. Nació tras el borrado accidental
 * del proyecto de producción el 21/09/2026, cuando no había ninguna copia de las fotos.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/backupSupabase.ts <carpeta_destino> [--tables-only]
 *
 * - Storage es incremental: solo baja los objetos que no existen ya en destino con el
 *   mismo tamaño. La primera corrida baja todo (~4 GB); las siguientes, lo nuevo.
 * - Se ejecuta semanalmente desde GitHub Actions (.github/workflows/backup-supabase.yml)
 *   y sube el resultado como artefacto; también sirve en local contra una carpeta de Drive.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!URL_ || !KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
const sb = createClient(URL_, KEY, { auth: { persistSession: false } })
const OUT = process.argv[2]
if (!OUT) throw new Error('Uso: backupSupabase.ts <carpeta_destino> [--tables-only]')
const TABLES_ONLY = process.argv.includes('--tables-only')
const TABLES = ['properties', 'leads', 'blog_posts', 'team_members', 'country_destinations', 'user_roles', 'agents', 'sync_logs', 'admin_audit_log', 'meta_leads_synced', 'meta_sync_runs', 'meta_leads']

async function dumpTables(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
  for (const t of TABLES) {
    const rows: unknown[] = []
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from(t).select('*').range(from, from + 999)
      if (error) throw new Error(`${t}: ${error.message}`)
      rows.push(...(data ?? []))
      if (!data || data.length < 1000) break
    }
    fs.writeFileSync(path.join(dir, `${t}.json`), JSON.stringify(rows))
    console.log(`  ${t.padEnd(20)} ${rows.length}`)
  }
  const users: unknown[] = []
  for (let page = 1; ; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    users.push(...data.users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at, user_metadata: u.user_metadata })))
    if (data.users.length < 1000) break
  }
  fs.writeFileSync(path.join(dir, 'auth_users.json'), JSON.stringify(users))
  console.log(`  ${'auth_users'.padEnd(20)} ${users.length}`)
}

async function listAll(bucket: string, prefix = ''): Promise<{ name: string; size: number }[]> {
  const out: { name: string; size: number }[] = []
  // Páginas de 100: con limit 1000 el list devuelve menos objetos de los que hay y offset>=1000 da undefined.
  for (let offset = 0; ; offset += 100) {
    let data: { name: string; id: string | null; metadata?: Record<string, unknown> }[] | null = null, error: { message: string } | null = null
      for (let t = 0; t < 6; t++) { ({ data, error } = await sb.storage.from(bucket).list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }) as never); if (!error) break; await new Promise(r => setTimeout(r, 1500 * (t + 1))) }
      await new Promise(r => setTimeout(r, 120))
    if (error) throw new Error(`${bucket}/${prefix}: ${error.message}`)
    for (const e of data ?? []) {
      const full = prefix ? `${prefix}/${e.name}` : e.name
      if (e.id === null) out.push(...await listAll(bucket, full))          // carpeta
      else out.push({ name: full, size: Number(e.metadata?.size ?? 0) })
    }
    if (!data || data.length < 100) break
  }
  return out
}

async function dumpStorage(dir: string) {
  const { data: buckets, error } = await sb.storage.listBuckets()
  if (error) throw error
  let files = 0, bytes = 0, skipped = 0, failed = 0
  for (const b of buckets ?? []) {
    const objs = await listAll(b.name)
    console.log(`  bucket ${b.name}: ${objs.length} objetos`)
    for (const o of objs) {
      const dest = path.join(dir, b.name, o.name)
      if (fs.existsSync(dest) && fs.statSync(dest).size === o.size) { skipped++; continue }
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      const { data, error: e } = await sb.storage.from(b.name).download(o.name)
      if (e || !data) { failed++; console.error(`    ✗ ${b.name}/${o.name}: ${e?.message}`); continue }
      fs.writeFileSync(dest, Buffer.from(await data.arrayBuffer()))
      files++; bytes += o.size
      if (files % 200 === 0) console.log(`    ${files} bajados (${(bytes / 1048576).toFixed(0)} MB)`)
    }
  }
  console.log(`  Storage: ${files} bajados (${(bytes / 1048576).toFixed(0)} MB), ${skipped} ya existían, ${failed} fallos`)
  // Fallos puntuales (objetos borrados durante la corrida, 429/500 del pool) no invalidan el backup:
  // quedan listados arriba y el objeto se reintenta en la próxima corrida incremental.
  if (failed > 50) process.exitCode = 1
}

async function main() {
  const stamp = new Date().toISOString().slice(0, 10)
  console.log(`Backup de ${new globalThis.URL(URL_).host} → ${OUT}`)
  console.log('== tablas ==')
  await dumpTables(path.join(OUT, 'tables', stamp))
  if (!TABLES_ONLY) { console.log('== storage (incremental) =='); await dumpStorage(path.join(OUT, 'storage')) }
  fs.writeFileSync(path.join(OUT, 'LAST_BACKUP.txt'), `${new Date().toISOString()} ${URL_}\n`)
  console.log('OK')
}
main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
