/**
 * Script: import-destinations.ts
 * Importa country destinations desde CSV → Supabase tabla country_destinations
 * Uso: npx tsx scripts/import-destinations.ts
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
  "C:/Users/Asus/Desktop/proyecto/assets-golden/web/Lovable data/country_destinations-export-2026-04-09_22-26-17.csv"
);

function generateSlug(countryName: string): string {
  return (countryName || "pais")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-");
}

function parseJsonSafe(val: string): unknown {
  if (!val || val === "NULL" || val === "{}" || val === "[]") return null;
  try { return JSON.parse(val); }
  catch { return null; }
}

interface CsvRow {
  id: string; country_name: string; tagline: string; description: string;
  hero_image_url: string; highlights: string; market_info: string;
  lifestyle: string; created_at: string; updated_at: string;
  card_image_url: string; tagline_en: string; description_en: string;
  highlights_en: string; market_info_en: string; lifestyle_en: string;
}

function mapRow(row: CsvRow, idx: number) {
  return {
    id:             row.id || undefined,
    country_name:   row.country_name?.trim() || "País",
    slug:           generateSlug(row.country_name),
    tagline:        row.tagline || null,
    tagline_en:     row.tagline_en || null,
    description:    row.description || null,
    description_en: row.description_en || null,
    hero_image_url: row.hero_image_url || null,
    card_image_url: row.card_image_url || null,
    highlights:     parseJsonSafe(row.highlights) ?? [],
    highlights_en:  parseJsonSafe(row.highlights_en) ?? [],
    market_info:    parseJsonSafe(row.market_info),
    market_info_en: parseJsonSafe(row.market_info_en),
    lifestyle:      parseJsonSafe(row.lifestyle),
    lifestyle_en:   parseJsonSafe(row.lifestyle_en),
    sort_order:     idx,
    active:         true,
    created_at:     row.created_at || new Date().toISOString(),
  };
}

async function main() {
  console.log("════════════════════════════════════════");
  console.log("  Assets Golden — Importación Country Destinations");
  console.log("════════════════════════════════════════\n");

  // Verificar que la tabla existe
  const { error: tableCheck } = await supabase
    .from("country_destinations")
    .select("id")
    .limit(1);

  if (tableCheck) {
    console.error("❌ La tabla country_destinations no existe o no es accesible.");
    console.error("   Error:", tableCheck.message);
    console.error("\n⚠️  Ejecuta primero el SQL de la migración en el dashboard de Supabase:");
    console.error("   https://supabase.com/dashboard/project/mromkwpqrxpxbbxhdofs/sql/new\n");
    process.exit(1);
  }

  const rows: CsvRow[] = await new Promise((resolve, reject) => {
    const acc: CsvRow[] = [];
    fs.createReadStream(CSV_PATH, { encoding: "utf-8" })
      .pipe(parse({ delimiter: ";", columns: true, skip_empty_lines: true, relax_quotes: true }))
      .on("data", (r: CsvRow) => acc.push(r))
      .on("error", reject)
      .on("end", () => resolve(acc));
  });

  console.log(`📖 CSV leído: ${rows.length} destinos\n`);
  const mapped = rows.map((row, idx) => mapRow(row, idx));

  const { error } = await supabase
    .from("country_destinations")
    .upsert(mapped, { onConflict: "id", ignoreDuplicates: false });

  if (error) {
    console.error("❌ Error bulk:", error.message);
    let ok = 0, errors = 0;
    for (const row of mapped) {
      const { error: e } = await supabase
        .from("country_destinations")
        .upsert(row, { onConflict: "id" });
      if (e) { errors++; console.error(`  ❌ ${row.country_name}: ${e.message}`); }
      else ok++;
    }
    console.log(`\n✅ OK: ${ok} | ❌ Errores: ${errors}`);
  } else {
    console.log(`✅ ${rows.length} destinos importados correctamente`);
  }

  const { data: sample } = await supabase
    .from("country_destinations")
    .select("country_name, slug, tagline, active")
    .order("sort_order");

  if (sample) {
    console.log("\n📌 Destinos importados:");
    sample.forEach(d =>
      console.log(`  • ${d.country_name} (${d.slug}) — ${d.tagline?.slice(0, 60) ?? "—"}`)
    );
  }
  console.log("\n════════════════════════════════════════");
}

main().catch(err => { console.error("❌ Fatal:", err); process.exit(1); });
