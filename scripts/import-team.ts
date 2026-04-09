/**
 * Script: import-team.ts
 * Importa miembros del equipo desde CSV → Supabase tabla team_members
 * Uso: npx tsx scripts/import-team.ts
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
}
loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const CSV_PATH = path.resolve(
  "C:/Users/Asus/Desktop/proyecto/assets-golden/web/Lovable data/team_members-export-2026-04-09_22-25-29.csv"
);

function parseJsonSafe(val: string): unknown[] {
  if (!val || val === "NULL" || val === "[]") return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

interface CsvRow {
  id: string; name: string; role_es: string; role_en: string;
  title_es: string; title_en: string; bio_es: string; bio_en: string;
  specialties_es: string; specialties_en: string; image_url: string;
  linkedin_url: string; member_type: string; sort_order: string;
  visible: string; created_at: string; updated_at: string;
  website_url: string; activities_es: string; activities_en: string;
  country: string; logo_url: string;
}

function mapRow(row: CsvRow) {
  return {
    id:           row.id || undefined,
    name:         row.name?.trim() || "Sin nombre",
    role_es:      row.role_es || null,
    role_en:      row.role_en || null,
    bio_es:       row.bio_es || null,
    bio_en:       row.bio_en || null,
    specialties:  parseJsonSafe(row.specialties_es),
    photo_url:    row.image_url || null,
    linkedin_url: row.linkedin_url || null,
    country:      row.country || null,
    member_type:  row.member_type || "team",
    order_index:  row.sort_order ? global.parseInt(row.sort_order, 10) : 0,
    active:       row.visible?.toLowerCase() !== "false",
    created_at:   row.created_at || new Date().toISOString(),
  };
}

async function main() {
  console.log("════════════════════════════════════════");
  console.log("  Assets Golden — Importación Team Members");
  console.log("════════════════════════════════════════\n");

  const rows: CsvRow[] = await new Promise((resolve, reject) => {
    const acc: CsvRow[] = [];
    fs.createReadStream(CSV_PATH, { encoding: "utf-8" })
      .pipe(parse({ delimiter: ";", columns: true, skip_empty_lines: true, relax_quotes: true }))
      .on("data", (r: CsvRow) => acc.push(r))
      .on("error", reject)
      .on("end", () => resolve(acc));
  });

  console.log(`📖 CSV leído: ${rows.length} miembros\n`);

  // Añadir columna external_id si no existe
  const mapped = rows.map(mapRow);

  const { error } = await supabase
    .from("team_members")
    .upsert(mapped, { onConflict: "id", ignoreDuplicates: false });

  if (error) {
    console.error("❌ Error en upsert:", error.message);
    let ok = 0, errors = 0;
    for (const row of mapped) {
      const { error: e } = await supabase.from("team_members").upsert(row, { onConflict: "id" });
      if (e) { errors++; console.error(`  ❌ ${row.name}: ${e.message}`); }
      else ok++;
    }
    console.log(`\n✅ OK: ${ok} | ❌ Errores: ${errors}`);
  } else {
    console.log(`✅ ${rows.length} miembros importados correctamente`);
  }

  // Validar
  const { data: sample } = await supabase
    .from("team_members")
    .select("name, role_es, member_type, order_index, active")
    .order("order_index");

  if (sample) {
    console.log("\n📌 Equipo importado:");
    sample.forEach(m =>
      console.log(`  [${m.order_index}] ${m.name} — ${m.role_es ?? m.member_type} (${m.active ? "activo" : "inactivo"})`)
    );
  }
  console.log("\n════════════════════════════════════════");
}

main().catch(err => { console.error("❌ Fatal:", err); process.exit(1); });
