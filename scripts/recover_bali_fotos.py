"""
FASE-4.N-P4.1 — Recuperar carpetas de fotos correctas para las 18 propiedades
que fallaron en P4 (15 SIN FOTOS + 3 con acceso denegado).

Estrategia:
  - Cada propiedad tiene 2-3 folder IDs en drive_folder_ids (bali-raw.json).
  - El que estaba en el CSV era siempre el write-up; probar los alternativos.
  - probe() usa skip_download=True: lista archivos sin descargar.
  - Si probe detecta imágenes → descargar; si no → siguiente alternativa.
  - Actualiza bali-carga-final.csv con la URL correcta.
"""

import csv, json, pathlib, shutil, sys, tempfile, time
from datetime import datetime
import gdown

# ── constantes ────────────────────────────────────────────────────────────────

PHOTO_EXTS = {'.jpg', '.jpeg', '.png', '.heic', '.webp', '.bmp',
              '.tiff', '.tif', '.avif', '.dng', '.raw'}

BASE      = pathlib.Path('C:/Users/Asus/Desktop/proyecto/assets-golden-next')
RAW_JSON  = BASE / 'scripts/output/bali-raw.json'
CSV_IN    = BASE / 'scripts/output/bali-carga-final.csv'
CSV_OUT   = BASE / 'scripts/output/bali-carga-final.csv'   # sobrescribir
FOTOS_DIR = BASE / 'scripts/output/bali-fotos'
LOG_PATH  = BASE / 'scripts/output/bali-recover-fotos.log'

LOG_PATH.write_text('', encoding='utf-8')

TARGETS_SIN_FOTOS = [
    'PV986','PV634','PV1031','PV860','PV975','PV704','PV443','PV042',
    'PD974A','PD199','PD441A','PD557','PD879','PD1040','PD1010',
]
TARGETS_ACCESO_DENEGADO = ['PV464', 'PV261', 'PV163']
ALL_TARGETS = TARGETS_SIN_FOTOS + TARGETS_ACCESO_DENEGADO

# ── helpers ───────────────────────────────────────────────────────────────────

def log(msg: str):
    ts   = datetime.now().strftime('%H:%M:%S')
    line = f'[{ts}] {msg}'
    print(line, flush=True)
    with open(LOG_PATH, 'a', encoding='utf-8') as lf:
        lf.write(line + '\n')


def probe_folder(folder_id: str) -> tuple[bool | None, list[str]]:
    """
    Lista archivos de una carpeta Drive SIN descargar.
    Retorna:
      (True,  [filenames])   → carpeta accesible con imágenes
      (False, [filenames])   → carpeta accesible pero sin imágenes (solo docs)
      (None,  [error_str])   → no accesible (permiso denegado u otro error)
    """
    url = f'https://drive.google.com/drive/folders/{folder_id}'
    tmp = tempfile.mkdtemp(prefix='probe_')
    try:
        result = gdown.download_folder(url, output=tmp, quiet=True, skip_download=True)
        if result is None:
            return None, ['result=None (sin archivos o error silencioso)']
        names = [getattr(r, 'path', str(r)) for r in result]
        has_images = any(
            pathlib.Path(n).suffix.lower() in PHOTO_EXTS for n in names
        )
        return has_images, names
    except Exception as exc:
        return None, [str(exc)]
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def download_folder_to(folder_id: str, out_dir: pathlib.Path,
                       retries: int = 3) -> list[pathlib.Path] | None:
    """Descarga carpeta Drive a out_dir. Retorna rutas de imágenes o None si falla."""
    url = f'https://drive.google.com/drive/folders/{folder_id}'
    for attempt in range(1, retries + 1):
        try:
            result = gdown.download_folder(
                url, output=str(out_dir),
                quiet=False, use_cookies=True
            )
            if result is None:
                log(f'  Intento {attempt}: result=None')
                continue
            # Filtrar imágenes en orden Drive, deduplicando rutas.
            # Drive puede tener dos archivos con el mismo nombre; gdown los
            # sobreescribe y lista ambos en result → skip duplicados.
            seen_paths: set[str] = set()
            photos: list[pathlib.Path] = []
            for r in result:
                p = pathlib.Path(r)
                key = str(p).lower()
                if key in seen_paths:
                    continue
                if p.exists() and p.is_file() and p.suffix.lower() in PHOTO_EXTS:
                    photos.append(p)
                    seen_paths.add(key)
            # Añadir imágenes extra de subcarpetas no listadas en result
            result_set = {pathlib.Path(r) for r in result}
            for f in out_dir.rglob('*'):
                key = str(f).lower()
                if f.is_file() and f not in result_set and \
                        f.suffix.lower() in PHOTO_EXTS and key not in seen_paths:
                    photos.append(f)
                    seen_paths.add(key)
            return photos
        except Exception as exc:
            log(f'  Intento {attempt}/{retries} falló: {exc}')
            if attempt < retries:
                time.sleep(15)
    return None


def move_docs_to_subfolder(src_dir: pathlib.Path):
    """Mueve archivos no-imagen de src_dir a src_dir/_docs/"""
    non_photos = [f for f in src_dir.iterdir()
                  if f.is_file() and f.suffix.lower() not in PHOTO_EXTS]
    if not non_photos:
        return []
    docs = src_dir / '_docs'
    docs.mkdir(exist_ok=True)
    moved = []
    for f in non_photos:
        dest = docs / f.name
        if dest.exists():
            dest = docs / (f.stem + '_dup' + f.suffix)
        shutil.move(str(f), str(dest))
        moved.append(f.name)
    return moved


def number_photos(photos: list[pathlib.Path], out_dir: pathlib.Path) -> int:
    """
    Numera y mueve las fotos a out_dir como 01_name.ext, 02_name.ext, ...
    photos debe estar en el orden correcto (Drive order).
    Retorna cantidad de fotos movidas.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    moved = 0
    pad = max(len(str(len(photos))), 2)
    for i, p in enumerate(photos, 1):
        if not p.exists():
            continue          # sobreescrito por duplicado de nombre → saltar
        new_name = f'{str(i).zfill(pad)}_{p.name}'
        dest = out_dir / new_name
        if p != dest:
            shutil.move(str(p), str(dest))
        moved += 1
    return moved


# ── cargar datos ─────────────────────────────────────────────────────────────

raw_data  = json.loads(RAW_JSON.read_text(encoding='utf-8'))
raw_by_id = {e['external_id']: e for e in raw_data}

with open(CSV_IN, encoding='utf-8', newline='') as f:
    reader    = csv.DictReader(f)
    fieldnames = reader.fieldnames
    csv_rows  = list(reader)

csv_by_id = {r['external_id']: r for r in csv_rows}

log(f'Iniciando recuperación para {len(ALL_TARGETS)} propiedades')
log('=' * 70)

# ── resultado de cada propiedad ───────────────────────────────────────────────

recovery_report = []   # list of dicts

for eid in ALL_TARGETS:
    raw_entry   = raw_by_id.get(eid, {})
    csv_row     = csv_by_id[eid]
    slug        = csv_row['slug_prestige']
    n_expected  = int(csv_row['n_fotos'])
    current_url = csv_row['drive_folder_fotos']
    current_id  = current_url.split('/')[-1]

    all_ids = raw_entry.get('drive_folder_ids', '').split('|')
    alt_ids = [i.strip() for i in all_ids if i.strip() and i.strip() != current_id]

    folder_name = f'{eid}_{slug}'
    out_dir     = FOTOS_DIR / folder_name

    log(f'\n-- {eid} (esperadas {n_expected}) -----------------')
    log(f'  Alternativas a probar: {alt_ids}')

    # SKIP solo si ya tiene fotos numeradas (>0 imágenes directas, no solo _docs)
    if out_dir.exists():
        existing = [f for f in out_dir.iterdir()
                    if f.is_file() and f.suffix.lower() in PHOTO_EXTS]
        if existing:
            log(f'  SKIP: {len(existing)} fotos ya existen')
            recovery_report.append({
                'eid': eid, 'slug': slug,
                'n_expected': n_expected, 'n_downloaded': len(existing),
                'new_folder_id': current_id,
                'status': 'SKIP (ya existía)',
                'probe_details': {},
            })
            continue

    found_id   = None
    probe_info = {}

    # Probar también la carpeta actual en caso de que sea de fotos privadas
    all_to_probe = alt_ids[:]
    # Para los 3 de acceso denegado: también probar la carpeta actual
    if eid in TARGETS_ACCESO_DENEGADO:
        all_to_probe = [current_id] + alt_ids

    for folder_id in all_to_probe:
        log(f'  Probando {folder_id} …')
        has_imgs, names = probe_folder(folder_id)
        log(f'    → has_images={has_imgs} | archivos={names[:5]}{"…" if len(names)>5 else ""}')
        probe_info[folder_id] = {'has_images': has_imgs, 'names': names}

        if has_imgs is True:
            found_id = folder_id
            log(f'    ✓ Carpeta de fotos encontrada: {folder_id}')
            break
        elif has_imgs is None:
            log(f'    ✗ Acceso denegado o error')
        else:
            log(f'    ✗ Solo docs/write-up')

        time.sleep(1)

    if found_id is None:
        log(f'  RESULTADO: ninguna carpeta accesible con imágenes → REQUIERE ATILIO')
        recovery_report.append({
            'eid': eid, 'slug': slug,
            'n_expected': n_expected, 'n_downloaded': 0,
            'new_folder_id': None,
            'status': 'REQUIERE ATILIO (ninguna carpeta accesible)',
            'probe_details': probe_info,
        })
        continue

    # ── descargar la carpeta correcta ─────────────────────────────────────────
    tmp_dir = FOTOS_DIR / f'_tmp_rec_{eid}'
    if tmp_dir.exists():
        shutil.rmtree(str(tmp_dir))
    tmp_dir.mkdir()

    log(f'  Descargando {found_id} …')
    photos = download_folder_to(found_id, tmp_dir)

    if photos is None:
        log(f'  RESULTADO: descarga falló → REQUIERE ATILIO')
        shutil.rmtree(str(tmp_dir), ignore_errors=True)
        recovery_report.append({
            'eid': eid, 'slug': slug,
            'n_expected': n_expected, 'n_downloaded': 0,
            'new_folder_id': found_id,
            'status': 'REQUIERE ATILIO (probe OK pero descarga falló)',
            'probe_details': probe_info,
        })
        continue

    # Mover docs a _docs dentro de tmp
    move_docs_to_subfolder(tmp_dir)

    # Numerar fotos y moverlas a out_dir
    out_dir.mkdir(exist_ok=True)
    n_moved = number_photos(photos, out_dir)

    # Mover docs si quedaron en tmp
    docs_src = tmp_dir / '_docs'
    if docs_src.exists():
        docs_dst = out_dir / '_docs'
        docs_dst.mkdir(exist_ok=True)
        for f in docs_src.iterdir():
            shutil.move(str(f), str(docs_dst / f.name))

    shutil.rmtree(str(tmp_dir), ignore_errors=True)

    # Actualizar CSV
    new_url = f'https://drive.google.com/drive/folders/{found_id}'
    csv_by_id[eid]['drive_folder_fotos'] = new_url

    n_dl = n_moved
    if n_dl == n_expected:
        status = 'OK'
    elif n_dl > n_expected:
        status = f'MAS ({n_dl} > {n_expected} esperadas)'
    elif n_dl == 0:
        status = f'SIN FOTOS (esperadas {n_expected})'
    else:
        status = f'MENOS ({n_dl} < {n_expected} esperadas)'

    log(f'  RESULTADO: {status} | {n_dl} fotos → {folder_name}')
    recovery_report.append({
        'eid': eid, 'slug': slug,
        'n_expected': n_expected, 'n_downloaded': n_dl,
        'new_folder_id': found_id,
        'status': status,
        'probe_details': probe_info,
    })

    time.sleep(2)

# ── escribir CSV actualizado ──────────────────────────────────────────────────

with open(CSV_OUT, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
    writer.writeheader()
    writer.writerows(csv_rows)

log('\n' + '=' * 70)
log('REPORTE FINAL DE RECUPERACIÓN')
log('=' * 70)
log(f'{"ID":10} | {"n_desc":6} | {"n_esp":5} | {"status"}')
log('-' * 70)

for r in recovery_report:
    log(f'{r["eid"]:10} | {r["n_downloaded"]:6} | {r["n_expected"]:5} | {r["status"]}')

ok_count      = sum(1 for r in recovery_report if r['status'] == 'OK')
less_count    = sum(1 for r in recovery_report if 'MENOS' in r['status'])
more_count    = sum(1 for r in recovery_report if 'MAS' in r['status'])
atilio_count  = sum(1 for r in recovery_report if 'ATILIO' in r['status'])

log('-' * 70)
log(f'OK={ok_count}  MENOS={less_count}  MAS={more_count}  REQUIERE_ATILIO={atilio_count}  TOTAL={len(recovery_report)}')
log(f'\nCSV actualizado: {CSV_OUT}')
log('Recuperación completada.')

# Guardar reporte JSON
rpt_path = BASE / 'scripts/output/bali-recover-fotos-reporte.json'
with open(rpt_path, 'w', encoding='utf-8') as f:
    json.dump(recovery_report, f, ensure_ascii=False, indent=2, default=str)
log(f'Reporte JSON: {rpt_path}')
