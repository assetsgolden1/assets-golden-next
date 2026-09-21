/**
 * Reconstrucción del proyecto Supabase tras el borrado accidental (22/09/2026).
 *
 * Pasos:
 *   schema  → ejecuta supabase/rebuild/01_schema.sql por conexión directa a Postgres
 *   data    → carga las 12 tablas desde ../backups-migracion-2026-09/supabase-tables-2026-09-05
 *   users   → recrea los 18 usuarios de Auth con el MISMO id (sin contraseña: deberán restablecerla)
 *   buckets → crea los 6 buckets públicos de Storage
 *   verify  → recuentos
 *
 * Uso:
 *   $env:PGPASSWORD="<db password del proyecto nuevo>"   (PowerShell)  o  export PGPASSWORD=...
 *   npx tsx --env-file=.env.local scripts/rebuildProject.ts schema
 *   npx tsx --env-file=.env.local scripts/rebuildProject.ts data users buckets verify
 *
 * Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY del proyecto NUEVO.
 * Idempotente: el schema usa IF NOT EXISTS; data/users usan upsert.
 */
import { createClient } from '@supabase/supabase-js'
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { Client } from 'pg'
import fs from 'node:fs'
import path from 'node:path'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!URL || !KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
const REF = new globalThis.URL(URL).host.split('.')[0]
const BACKUP = path.resolve('../backups-migracion-2026-09/supabase-tables-2026-09-05')
const steps = process.argv.slice(2)
const sb = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } })

// Orden de carga: primero las tablas sin FK a auth.users, después las que dependen de usuarios.
const TABLES_INDEPENDENT = ['properties', 'blog_posts', 'team_members', 'country_destinations', 'meta_leads_synced', 'meta_sync_runs', 'meta_leads', 'leads']
const TABLES_USER_LINKED = ['user_roles', 'agents', 'sync_logs', 'admin_audit_log']
const BUCKETS = ['property-images', 'destination-images', 'team-photos', 'hero-images', 'agent-logos', 'blog-images']

function readJson<T = Record<string, unknown>>(name: string): T[] {
  return JSON.parse(fs.readFileSync(path.join(BACKUP, `${name}.json`), 'utf8'))
}

async function pgClient() {
  const pw = process.env.PGPASSWORD
  if (!pw) throw new Error('Definí PGPASSWORD con la contraseña de la base del proyecto nuevo (no la pegues en el chat)')
  // Pooler de sesión (IPv4). Usuario: postgres.<ref>
  const host = process.env.PGHOST ?? `aws-1-eu-west-1.pooler.supabase.com`
  const c = new Client({ host, port: 5432, database: 'postgres', user: `postgres.${REF}`, password: pw, ssl: { rejectUnauthorized: false } })
  await c.connect()
  return c
}

async function stepSchema() {
  const sql = fs.readFileSync('supabase/rebuild/01_schema.sql', 'utf8')
  const c = await pgClient()
  try {
    await c.query(sql)
    const { rows } = await c.query(`select table_name from information_schema.tables where table_schema='public' order by 1`)
    console.log('schema OK — tablas:', rows.map((r: { table_name: string }) => r.table_name).join(', '))
    // Sincronizar la secuencia de ref_code con el máximo del backup (se carga en data, pero dejamos margen)
    const props = readJson('properties')
    const max = props.map(p => parseInt(String(p.ref_code ?? '').replace('AG-', ''), 10)).filter(n => !isNaN(n)).reduce((a, b) => Math.max(a, b), 0)
    await c.query(`select setval('public.properties_ref_code_seq', $1, true)`, [Math.max(max, 1)])
    console.log('secuencia ref_code posicionada en', max)
  } finally { await c.end() }
}

async function upsertTable(table: string, rows: Record<string, unknown>[], conflict = 'id') {
  const CH = 200
  let n = 0
  for (let i = 0; i < rows.length; i += CH) {
    const chunk = rows.slice(i, i + CH)
    const { error } = await sb.from(table).upsert(chunk, { onConflict: conflict })
    if (error) throw new Error(`${table} [${i}]: ${error.message}`)
    n += chunk.length
  }
  console.log(`  ${table}: ${n} filas`)
}

async function stepData() {
  console.log('Cargando tablas independientes…')
  for (const t of TABLES_INDEPENDENT) {
    const rows = readJson(t)
    if (!rows.length) { console.log(`  ${t}: 0 filas (vacía en el backup)`); continue }
    await upsertTable(t, rows, t === 'meta_leads_synced' ? 'meta_lead_id' : 'id')
  }
}

async function stepUsers() {
  const users = readJson<{ id: string; email: string; created_at: string; last_sign_in_at: string | null }>('auth_users')
  const roles = readJson<{ user_id: string; role: string }>('user_roles')
  const roleOf = new Map(roles.map(r => [r.user_id, r.role]))
  console.log(`Recreando ${users.length} usuarios de Auth con su id original…`)
  const { data: existing } = await sb.auth.admin.listUsers({ perPage: 1000 })
  const have = new Set((existing?.users ?? []).map(u => u.id))
  for (const u of users) {
    if (have.has(u.id)) { console.log(`  ${u.email}: ya existe`); continue }
    const { error } = await sb.auth.admin.createUser({
      id: u.id, email: u.email, email_confirm: true,
      user_metadata: { restored_from_backup: '2026-09-05', role_hint: roleOf.get(u.id) ?? null },
    } as Parameters<typeof sb.auth.admin.createUser>[0] & { id: string })
    if (error) throw new Error(`${u.email}: ${error.message}`)
    console.log(`  ${u.email}: creado (${roleOf.get(u.id) ?? 'sin rol'})`)
  }
  console.log('Cargando tablas ligadas a usuarios…')
  for (const t of TABLES_USER_LINKED) {
    const rows = readJson(t)
    if (!rows.length) { console.log(`  ${t}: 0 filas`); continue }
    await upsertTable(t, rows)
  }
}

async function stepBuckets() {
  const { data: existing } = await sb.storage.listBuckets()
  const have = new Set((existing ?? []).map(b => b.name))
  for (const b of BUCKETS) {
    if (have.has(b)) { console.log(`  bucket ${b}: ya existe`); continue }
    const { error } = await sb.storage.createBucket(b, { public: true })
    if (error) throw new Error(`bucket ${b}: ${error.message}`)
    console.log(`  bucket ${b}: creado (público)`)
  }
}

async function stepVerify() {
  for (const t of [...TABLES_INDEPENDENT, ...TABLES_USER_LINKED]) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true })
    console.log(`  ${t.padEnd(20)} ${error ? 'ERROR ' + error.message : count}`)
  }
  const { data: users } = await sb.auth.admin.listUsers({ perPage: 1000 })
  console.log(`  auth.users            ${users?.users.length ?? '?'}`)
  const { data: rpc, error: rpcErr } = await sb.rpc('get_property_filters')
  console.log('  get_property_filters  ', rpcErr ? 'ERROR ' + rpcErr.message : `${(rpc as { countries: string[] }).countries?.length} países`)
  const { data: buckets } = await sb.storage.listBuckets()
  console.log('  buckets               ', (buckets ?? []).map(b => b.name).join(', '))
}

async function main() {
  console.log('Proyecto destino:', REF)
  if (REF === 'mromkwpqrxpxbbxhdofs') throw new Error('Ese es el proyecto borrado; apuntá .env.local al nuevo')
  for (const s of steps) {
    console.log(`\n== ${s} ==`)
    if (s === 'schema') await stepSchema()
    else if (s === 'data') await stepData()
    else if (s === 'users') await stepUsers()
    else if (s === 'buckets') await stepBuckets()
    else if (s === 'verify') await stepVerify()
    else throw new Error('paso desconocido: ' + s)
  }
}
main().catch(e => { console.error('\nFALLO:', e.message); process.exit(1) })
