"""
FASE-4.N-P3 — Patch final del dataset de Bali
Genera:
  scripts/output/bali-carga-final.csv        (26 filas)
  scripts/output/bali-pendiente-atilio.csv   (1 fila: PV656)
"""

import csv, io, sys, textwrap, math
from pathlib import Path

ROOT = Path(__file__).parent.parent
INPUT  = ROOT / "scripts/output/bali-carga-dataset.csv"
OUTPUT = ROOT / "scripts/output/bali-carga-final.csv"
PENDING = ROOT / "scripts/output/bali-pendiente-atilio.csv"

# ── helpers ──────────────────────────────────────────────────────────────────

changes = []  # list of dicts: {id, campo, antes, despues}

def record(eid, campo, antes, despues):
    changes.append({"id": eid, "campo": campo, "antes": antes, "despues": despues})

def replace_in_desc(eid, row, old_fragment, new_fragment, label=None):
    desc = row["descripcion_es"]
    if old_fragment not in desc:
        print(f"  ⚠  [{eid}] fragmento NO encontrado: {old_fragment[:60]!r}…")
        return row
    new_desc = desc.replace(old_fragment, new_fragment, 1)
    record(eid, "descripcion_es" + (f" [{label}]" if label else ""), old_fragment, new_fragment or "(eliminado)")
    row["descripcion_es"] = new_desc
    return row

# ── leer CSV ─────────────────────────────────────────────────────────────────

with open(INPUT, encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

print(f"Filas leídas: {len(rows)}")

final_rows   = []
pending_rows = []

for row in rows:
    eid = row["external_id"]

    # ── 7) PV656: mover a pendiente ──────────────────────────────────────────
    if eid == "PV656":
        row["nota"] = (
            "definir zona (Canggu vs Umalas) y si el precio/dormitorios "
            "es del conjunto de 3 villas o por villa"
        )
        pending_rows.append(row)
        continue

    # ── 4) bathrooms → INTEGER ───────────────────────────────────────────────
    bath_raw = row["bathrooms"].strip()
    try:
        bath_f = float(bath_raw)
        bath_i = math.ceil(bath_f) if bath_f != int(bath_f) else int(bath_f)  # 2.5 → 3
        if str(bath_i) != bath_raw:
            record(eid, "bathrooms", bath_raw, str(bath_i))
            row["bathrooms"] = str(bath_i)
        else:
            row["bathrooms"] = str(bath_i)  # normaliza "3.0" → "3" si existiera
    except ValueError:
        pass

    # ── 2) TÍTULOS ────────────────────────────────────────────────────────────
    if eid == "PD1010":
        old = row["title_es"]
        new = "Lujosa Villa Leasehold de 3 Dormitorios a Orillas del Río en Ubud"
        record(eid, "title_es", old, new)
        row["title_es"] = new

    if eid == "PD557":
        old = row["title_es"]
        new = "Lofts de Lujo Leasehold en Canggu"
        record(eid, "title_es", old, new)
        row["title_es"] = new

    if eid == "PV461":
        suffix = " – Descuento por Reserva Anticipada"
        if suffix in row["title_es"]:
            old = row["title_es"]
            new = old.replace(suffix, "")
            record(eid, "title_es", old, new)
            row["title_es"] = new

    # ── 3) PD557: bedrooms=1, price=130000 ───────────────────────────────────
    if eid == "PD557":
        if row["bedrooms"] != "1":
            record(eid, "bedrooms", row["bedrooms"], "1")
            row["bedrooms"] = "1"
        if row["price"] != "130000":
            record(eid, "price", row["price"], "130000")
            row["price"] = "130000"

    # ── 6) NOTAS: PV042 y PD879 ───────────────────────────────────────────────
    if eid in ("PV042", "PD879"):
        suffix = " — precio convertido de IDR — confirmar con Atilio"
        old = row["nota"]
        if suffix not in old:
            new = old + suffix
            record(eid, "nota", old, new)
            row["nota"] = new

    # ── 1) + 5) LIMPIEZA EN DESCRIPCIONES ────────────────────────────────────

    # ---- PD1010 ----
    if eid == "PD1010":
        # Fragmento financiero completo (3 bullets + párrafo anterior)
        row = replace_in_desc(eid, row,
            "es más que un santuario tropical: es un vehículo de inversión de alto "
            "rendimiento diseñado para compradores que buscan retornos asegurados y "
            "crecimiento de capital significativo en Ubud.",
            "es un santuario tropical en Ubud.",
            "intro"
        )
        row = replace_in_desc(eid, row,
            "\n\n¿Por qué comprar ahora? Asegura un activo premium al 35% por debajo "
            "del valor de mercado actual (1.700 USD/m²). Esta oportunidad de "
            "pre-construcción ofrece ganancia inmediata de capital y una estructura "
            "totalmente gestionada para una propiedad sin intervención directa.\n\n"
            "• ROI garantizado: 12% fijo para los primeros dos años "
            "(garantizado contractualmente).\n"
            "• ROI proyectado: 14% anual en adelante según modelo financiero.\n"
            "• Revalorización del capital: incremento estimado del 35% al "
            "completarse la obra.",
            "",
            "bloque ROI + descuento"
        )

    # ---- PD557 ----
    if eid == "PD557":
        # Apertura con escasez
        row = replace_in_desc(eid, row,
            "No pierdas tu oportunidad de adquirir uno de los 8 lofts de lujo "
            "restantes de esta exclusiva colección de 15 villas completamente "
            "amuebladas en Canggu.",
            "Descubre esta exclusiva colección de lofts de lujo completamente "
            "amueblados en Canggu.",
            "apertura"
        )
        # Precios: quitar referencia al de 2 dormitorios
        row = replace_in_desc(eid, row,
            "Precios:\n• Loft de 1 dormitorio: 130.000 USD – 80 m²\n"
            "• Loft de 2 dormitorios: 140.000 USD – 80 m²",
            "Precio:\n• Loft de 1 dormitorio: 130.000 USD – 80 m²",
            "precio 2dorm"
        )
        # Bloque rentabilidad
        row = replace_in_desc(eid, row,
            "\n\nPotencial de inversión:\n"
            "• Rentabilidad por alquiler estimada: 13–20% anual\n"
            "• Rentabilidad estimada en venta tras finalización: 25–35%",
            "",
            "rentabilidad"
        )
        # Cierre con "alta rentabilidad"
        row = replace_in_desc(eid, row,
            "estos lofts ofrecen la combinación perfecta de lujo, comodidad y alta rentabilidad.",
            "estos lofts ofrecen la combinación perfecta de lujo y comodidad.",
            "cierre rentabilidad"
        )

    # ---- PV975 ----
    if eid == "PV975":
        row = replace_in_desc(eid, row,
            "• Propiedad llave en mano lista para vivir o para alquilar con alta rentabilidad\n"
            "• ROI estimado de hasta el 10–12% anual.",
            "• Propiedad llave en mano lista para vivir o para alquilar.",
            "ROI"
        )

    # ---- PV924 ----
    if eid == "PV924":
        row = replace_in_desc(eid, row,
            " Los ingresos anuales proyectados oscilan entre 46.110 USD "
            "(60% de ocupación) y 75.563 USD (95% de ocupación), con un ROI "
            "estimado de entre 3,9 y 6,4 años.",
            "",
            "ROI proyectado"
        )

    # ---- PD199 ----
    if eid == "PD199":
        # Rentabilidad 1 dorm
        row = replace_in_desc(eid, row,
            ", con una rentabilidad estimada del 17,85%.",
            ".",
            "rentabilidad 1dorm"
        )
        # Rentabilidad 2 dorm
        row = replace_in_desc(eid, row,
            " y una rentabilidad estimada del 19,4%.",
            ".",
            "rentabilidad 2dorm"
        )
        # Fecha vencida (dic 2023)
        row = replace_in_desc(eid, row,
            " Entrega prevista para finales de diciembre de 2023 con opción a elegir entre 3 diseños diferentes.",
            " Disponibles con opción a elegir entre 3 diseños diferentes.",
            "fecha vencida"
        )

    # ---- PD992 ----
    if eid == "PD992":
        row = replace_in_desc(eid, row,
            "gestión profesional orientada a un ROI estable.",
            "gestión profesional.",
            "ROI"
        )
        row = replace_in_desc(eid, row,
            "• Ingresos garantizados: rentabilidad mínima del 6% anual "
            "garantizada contractualmente durante los primeros dos años.\n",
            "",
            "garantía 6%"
        )
        row = replace_in_desc(eid, row,
            "; la villa comienza a generar ingresos por alquiler desde el mes 12.",
            ".",
            "proyección mes 12"
        )

    # ---- PV042 ----
    if eid == "PV042":
        row = replace_in_desc(eid, row,
            " Excelente oportunidad de negocio con alta tasa de ocupación "
            "(80–95%), generando entre 500 y 700 millones de rupias mensuales "
            "y recuperación de la inversión en 4 o 5 años.",
            "",
            "ROI / ocupación"
        )

    # ---- PD441A: fecha vencida (31/01/2025) ----
    if eid == "PD441A":
        row = replace_in_desc(eid, row,
            " y finalización prevista para el 31/01/2025,",
            ",",
            "fecha vencida"
        )

    # ---- PD1046: fecha vencida (junio 2026 = mes actual) ----
    if eid == "PD1046":
        row = replace_in_desc(eid, row,
            " Finalización prevista para junio de 2026.",
            "",
            "fecha vencida"
        )

    final_rows.append(row)

# ── escribir bali-carga-final.csv ────────────────────────────────────────────

with open(OUTPUT, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(final_rows)

# ── escribir bali-pendiente-atilio.csv ───────────────────────────────────────

with open(PENDING, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(pending_rows)

# ── reporte ───────────────────────────────────────────────────────────────────

print(f"\n{'='*70}")
print(f"RESULTADO: {len(final_rows)} filas en bali-carga-final.csv")
print(f"           {len(pending_rows)} fila(s) en bali-pendiente-atilio.csv")
print(f"{'='*70}\n")

def fmt(s, maxlen=120):
    s = s.strip().replace("\n", " ↵ ")
    return s[:maxlen] + ("…" if len(s) > maxlen else "")

current_id = None
for c in changes:
    if c["id"] != current_id:
        print(f"\n-- {c['id']} --")
        current_id = c["id"]
    print(f"  [{c['campo']}]")
    print(f"    ANTES:  {fmt(c['antes'])}")
    print(f"    DESPUES:{fmt(c['despues'])}")

print("\nDone.")
