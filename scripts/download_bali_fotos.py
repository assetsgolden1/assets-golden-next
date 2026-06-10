"""
FASE-4.N-P4 — Descarga de fotos Bali
Lee bali-carga-final.csv (26 filas), descarga todas las imágenes de cada
carpeta de Drive y las organiza numeradas (01_, 02_, ...) en:
  scripts/output/bali-fotos/<external_id>_<slug>/

No selecciona ni descarta fotos. Solo descarga y ordena.
"""

import csv, json, pathlib, shutil, sys, time
from datetime import datetime

import gdown

# ── configuración ─────────────────────────────────────────────────────────────

PHOTO_EXTS = {'.jpg', '.jpeg', '.png', '.heic', '.webp', '.bmp',
              '.tiff', '.tif', '.avif', '.dng', '.raw'}

BASE      = pathlib.Path('C:/Users/Asus/Desktop/proyecto/assets-golden-next')
INPUT_CSV = BASE / 'scripts/output/bali-carga-final.csv'
FOTOS_DIR = BASE / 'scripts/output/bali-fotos'
LOG_PATH  = BASE / 'scripts/output/bali-fotos-descarga.log'
RPT_PATH  = BASE / 'scripts/output/bali-fotos-reporte.json'

FOTOS_DIR.mkdir(parents=True, exist_ok=True)

# Limpiar log anterior
LOG_PATH.write_text('', encoding='utf-8')

# ── helpers ───────────────────────────────────────────────────────────────────

def log(msg: str):
    ts   = datetime.now().strftime('%H:%M:%S')
    line = f'[{ts}] {msg}'
    print(line, flush=True)
    with open(LOG_PATH, 'a', encoding='utf-8') as lf:
        lf.write(line + '\n')


def download_folder(url: str, out: pathlib.Path, retries: int = 3):
    """Descarga carpeta Drive; devuelve lista de rutas o None si falla todo."""
    for attempt in range(1, retries + 1):
        try:
            result = gdown.download_folder(
                url, output=str(out),
                quiet=False, use_cookies=True
            )
            return result          # lista de paths (puede ser vacía)
        except Exception as exc:
            log(f'  Intento {attempt}/{retries} falló: {exc}')
            if attempt < retries:
                time.sleep(15)
    return None                    # todos los intentos fallaron


def ordered_photo_paths(result_list):
    """
    Devuelve los archivos de imagen en el orden retornado por gdown
    (= orden de listado en Drive).
    """
    photos = []
    for r in (result_list or []):
        p = pathlib.Path(r)
        if p.is_file() and p.suffix.lower() in PHOTO_EXTS:
            photos.append(p)
    return photos


def move_docs(all_files, out_dir: pathlib.Path):
    """Mueve archivos no-imagen a _docs/ dentro de out_dir."""
    docs = [f for f in all_files if f.is_file() and f.suffix.lower() not in PHOTO_EXTS]
    if not docs:
        return []
    docs_dir = out_dir / '_docs'
    docs_dir.mkdir(exist_ok=True)
    moved = []
    for doc in docs:
        dest = docs_dir / doc.name
        # Evitar colisiones de nombre
        if dest.exists():
            dest = docs_dir / (doc.stem + '_2' + doc.suffix)
        shutil.move(str(doc), str(dest))
        moved.append(doc.name)
    return moved

# ── leer CSV ──────────────────────────────────────────────────────────────────

with open(INPUT_CSV, encoding='utf-8') as f:
    props = list(csv.DictReader(f))

log(f'Propiedades a descargar: {len(props)}')
log('=' * 70)

report = []

# ── loop principal ────────────────────────────────────────────────────────────

for idx, prop in enumerate(props, 1):
    eid        = prop['external_id']
    slug       = prop['slug_prestige']
    url        = prop['drive_folder_fotos']
    n_expected = int(prop['n_fotos'])

    folder_name = f'{eid}_{slug}'
    out_dir     = FOTOS_DIR / folder_name

    log(f'\n[{idx:02d}/{len(props)}] {eid} — esperadas: {n_expected}')

    # ── saltar si ya tiene imágenes numeradas ─────────────────────────────────
    if out_dir.exists():
        existing = [f for f in out_dir.iterdir()
                    if f.is_file() and f.suffix.lower() in PHOTO_EXTS]
        if existing:
            log(f'  SKIP: {len(existing)} fotos ya existen')
            report.append({
                'external_id':   eid,
                'slug':          slug,
                'n_esperadas':   n_expected,
                'n_descargadas': len(existing),
                'ruta_local':    str(out_dir),
                'status':        'SKIP (ya existía)',
            })
            continue

    # ── descargar a carpeta temporal ──────────────────────────────────────────
    tmp_dir = FOTOS_DIR / f'_tmp_{eid}'
    if tmp_dir.exists():
        shutil.rmtree(str(tmp_dir))
    tmp_dir.mkdir()

    result = download_folder(url, tmp_dir)

    if result is None:
        log(f'  ERROR: falló después de 3 intentos')
        shutil.rmtree(str(tmp_dir), ignore_errors=True)
        report.append({
            'external_id':   eid,
            'slug':          slug,
            'n_esperadas':   n_expected,
            'n_descargadas': 0,
            'ruta_local':    '',
            'status':        'FALLO (no se pudo conectar)',
        })
        continue

    # ── clasificar archivos descargados ───────────────────────────────────────
    all_files   = [f for f in tmp_dir.rglob('*') if f.is_file()]
    photo_files = ordered_photo_paths(result)

    # Archivos en result pero no imagen → docs
    non_photo_result = [pathlib.Path(r) for r in (result or [])
                        if pathlib.Path(r).is_file()
                        and pathlib.Path(r).suffix.lower() not in PHOTO_EXTS]
    # Archivos que rglob encontró pero NO estaban en result (subcarpetas, etc.)
    result_paths = {pathlib.Path(r) for r in (result or [])}
    extra_files  = [f for f in all_files if f not in result_paths]

    # Añadir extra imágenes al final (subcarpetas)
    for ef in sorted(extra_files, key=lambda x: x.name):
        if ef.suffix.lower() in PHOTO_EXTS:
            photo_files.append(ef)

    log(f'  Encontradas: {len(photo_files)} fotos | '
        f'{len(non_photo_result)} docs en result | '
        f'{len(extra_files)} archivos extra')

    # ── crear directorio final y mover numerando ──────────────────────────────
    out_dir.mkdir(exist_ok=True)
    pad = max(len(str(len(photo_files))), 2) if photo_files else 2

    for i, img in enumerate(photo_files, 1):
        new_name = f'{str(i).zfill(pad)}_{img.name}'
        dest = out_dir / new_name
        shutil.move(str(img), str(dest))

    # Mover docs (de result + extras no-imagen)
    remaining = [f for f in tmp_dir.rglob('*') if f.is_file()]
    moved_docs = move_docs(remaining, out_dir)
    if moved_docs:
        log(f'  _docs/: {moved_docs}')

    shutil.rmtree(str(tmp_dir), ignore_errors=True)

    # ── estado ────────────────────────────────────────────────────────────────
    n_dl = len(photo_files)
    if n_dl == 0:
        status = f'SIN FOTOS (esperadas {n_expected})'
    elif n_dl == n_expected:
        status = 'OK'
    elif n_dl > n_expected:
        status = f'MAS ({n_dl} > {n_expected} esperadas)'
    else:
        status = f'MENOS ({n_dl} < {n_expected} esperadas)'

    log(f'  {status}  →  {folder_name}')

    report.append({
        'external_id':   eid,
        'slug':          slug,
        'n_esperadas':   n_expected,
        'n_descargadas': n_dl,
        'ruta_local':    str(out_dir),
        'status':        status,
    })

    time.sleep(2)   # cortesía con la API de Drive

# ── guardar JSON y tabla final ────────────────────────────────────────────────

with open(RPT_PATH, 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

log('\n' + '=' * 70)
log('REPORTE FINAL')
log('=' * 70)
log(f'{"ID":10} | {"n_desc":6} | {"n_esp":5} | {"status"}')
log('-' * 70)
for r in report:
    log(f'{r["external_id"]:10} | {r["n_descargadas"]:6} | {r["n_esperadas"]:5} | {r["status"]}')

ok   = sum(1 for r in report if r['status'] == 'OK')
skip = sum(1 for r in report if 'SKIP' in r['status'])
fail = sum(1 for r in report if 'FALLO' in r['status'])
diff = len(report) - ok - skip - fail

log('-' * 70)
log(f'OK={ok}  SKIP={skip}  FALLO={fail}  DIFERENCIA={diff}  TOTAL={len(report)}')
log(f'\nReporte JSON: {RPT_PATH}')
log('Descarga completada.')
