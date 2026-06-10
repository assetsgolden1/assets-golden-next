"""
FASE-4.N-P2 — Generar bali-carga-dataset.csv
Combina bali-fixed.json (datos estructurados) + bali-translations.json (traducciones ES).
"""

import csv
import json
import os
import re

FIXED_JSON   = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-fixed.json"
TRANS_JSON   = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-translations.json"
OUTPUT_CSV   = r"C:\Users\Asus\Desktop\proyecto\assets-golden-next\scripts\output\bali-carga-dataset.csv"

with open(FIXED_JSON, encoding="utf-8") as f:
    fixed = json.load(f)

with open(TRANS_JSON, encoding="utf-8") as f:
    trans_list = json.load(f)

# Build translation lookup by slug
trans = {t["slug"]: t for t in trans_list}

# Determine the "photos" folder: the last folder ID (from phase-1 analysis)
# The first folder = write-up docs (0 images); the last = photos folder
def get_photos_folder(folder_ids_str: str) -> str:
    ids = [fid for fid in folder_ids_str.split("|") if fid]
    if not ids:
        return ""
    return ids[-1]  # last folder has the photos

rows = []
missing = []

FIELDNAMES = [
    "slug_prestige", "title_es", "property_type", "price", "currency",
    "location", "bedrooms", "bathrooms", "area_sqm",
    "external_id", "descripcion_es", "drive_folder_fotos", "n_fotos", "nota"
]

for p in fixed:
    slug = p["slug_prestige"]
    t    = trans.get(slug, {})

    title_es    = t.get("title_es", "")
    desc_es     = t.get("descripcion_es", "")
    nota        = t.get("nota", "")

    if p.get("area_note"):
        nota = (nota + " | " if nota else "") + p["area_note"]

    # Flag missing fields
    flags = []
    if not title_es:   flags.append("sin_title_es")
    if not desc_es:    flags.append("sin_descripcion_es")
    if not p.get("area_sqm"): flags.append("sin_area_sqm")

    if flags:
        missing.append({"slug": slug, "flags": flags})
        if flags:
            nota = (nota + " | " if nota else "") + "FALTA: " + ", ".join(flags)

    photos_folder = get_photos_folder(p.get("drive_folder_ids", ""))
    photos_url = f"https://drive.google.com/drive/folders/{photos_folder}" if photos_folder else ""

    rows.append({
        "slug_prestige":      slug,
        "title_es":           title_es,
        "property_type":      p.get("property_type", "villa"),
        "price":              p.get("price", ""),
        "currency":           p.get("currency", "USD"),
        "location":           p.get("location", ""),
        "bedrooms":           p.get("bedrooms", ""),
        "bathrooms":          p.get("bathrooms", ""),
        "area_sqm":           p.get("area_sqm", ""),
        "external_id":        p.get("external_id", ""),
        "descripcion_es":     desc_es,
        "drive_folder_fotos": photos_url,
        "n_fotos":            p.get("n_fotos", 0),
        "nota":               nota.strip(" |"),
    })

os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
    writer.writeheader()
    writer.writerows(rows)

print(f"CSV generado: {OUTPUT_CSV}")
print(f"Total filas: {len(rows)}")

# Summary
ok        = [r for r in rows if "FALTA:" not in (r["nota"] or "")]
con_notas = [r for r in rows if r["nota"] and "FALTA:" not in r["nota"]]
faltantes = [r for r in rows if "FALTA:" in (r["nota"] or "")]

print(f"\nCompletadas OK       : {len(ok)}")
print(f"Con notas aclaratorias: {len(con_notas)}")
print(f"Con campos faltantes  : {len(faltantes)}")

if faltantes:
    print("\nFILAS CON CAMPOS FALTANTES:")
    for r in faltantes:
        print(f"  - {r['slug_prestige']}  |  {r['nota']}")

print("\n--- RESUMEN COMPLETO ---")
print(f"{'#':>2}  {'external_id':10s}  {'price':>10s} {'cur':3s}  {'type':10s}  {'beds':4s}  {'area':5s}  {'title_es'[:40]}")
print("-" * 100)
for i, r in enumerate(rows, 1):
    print(f"{i:2d}  {r['external_id']:10s}  {r['price']:>10s} {r['currency']:3s}  {r['property_type']:10s}  "
          f"{r['bedrooms']:4s}  {r['area_sqm']:5s}  {r['title_es'][:50]}")
