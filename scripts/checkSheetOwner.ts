/**
 * Diagnóstico de owner del Sheet de leads.
 * Usa las credenciales de la SA para llamar Drive API y verificar
 * quién es el owner real. Si es la SA, comparte con ivalberini@gmail.com.
 *
 * Uso: npm run check-sheet-owner
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { google } from 'googleapis'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SHEET_ID = '1aAt2bG7Xxx3zv89t5u-FMyOlKbEX05anfQ1eJptc-c8'
const IVAN_EMAIL = 'ivalberini@gmail.com'

async function main() {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson) {
    console.error('ERROR: GOOGLE_SHEETS_CREDENTIALS_JSON no encontrado en .env.local')
    process.exit(1)
  }

  const credentials = JSON.parse(credentialsJson)
  const saEmail: string = credentials.client_email
  console.log(`\nService Account: ${saEmail}`)
  console.log(`Sheet ID:        ${SHEET_ID}`)
  console.log('─'.repeat(60))

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive',
    ],
  })

  const drive = google.drive({ version: 'v3', auth })

  // ── PASO 1: Obtener metadata del archivo ──────────────────────────
  console.log('\n[1] Consultando metadata del Sheet via Drive API...')
  let fileData: any
  try {
    const res = await drive.files.get({
      fileId: SHEET_ID,
      fields: 'id,name,createdTime,owners,permissions',
      // supportsAllDrives: true por si está en Shared Drive
      supportsAllDrives: true,
    })
    fileData = res.data
  } catch (err: any) {
    const status = err?.response?.status
    const message = err?.response?.data?.error?.message ?? err?.message

    if (status === 403) {
      console.error('\n[ERROR 403 — Scope/permiso insuficiente]')
      console.error(`Mensaje: ${message}`)
      console.error('\nPosibles causas:')
      console.error('  A) La Drive API no está habilitada en el proyecto agencia-automatizacion-490823')
      console.error('     Solución: ir a Google Cloud Console → APIs → habilitar "Google Drive API"')
      console.error('  B) La SA no tiene acceso al archivo (ni siquiera como reader)')
      console.error('     Solución: compartir manualmente el Sheet con la SA o verificar que la SA lo creó')
    } else if (status === 404) {
      console.error('\n[ERROR 404 — Archivo no encontrado]')
      console.error(`El Sheet ID ${SHEET_ID} no existe o la SA no tiene visibilidad sobre él.`)
      console.error('Esto puede ocurrir si el Sheet fue creado por otra cuenta y la SA no tiene acceso.')
    } else {
      console.error(`\n[ERROR ${status ?? 'desconocido'}]`)
      console.error(`Mensaje: ${message}`)
    }
    process.exit(1)
  }

  // ── PASO 2: Reportar metadata ──────────────────────────────────────
  console.log('\n[2] Resultado:')
  console.log(`  Nombre:      ${fileData.name}`)
  console.log(`  ID:          ${fileData.id}`)
  console.log(`  Creado el:   ${fileData.createdTime}`)

  const owners: any[] = fileData.owners ?? []
  if (owners.length === 0) {
    console.log('  Owners:      (sin datos — probablemente está en Shared Drive)')
  } else {
    console.log('  Owner(s):')
    for (const o of owners) {
      const marker = o.emailAddress === saEmail ? '  ← SERVICE ACCOUNT' : ''
      console.log(`    - ${o.displayName} <${o.emailAddress}>${marker}`)
    }
  }

  const permissions: any[] = fileData.permissions ?? []
  if (permissions.length > 0) {
    console.log('  Permissions actuales:')
    for (const p of permissions) {
      console.log(`    - ${p.emailAddress ?? p.type} | role: ${p.role} | id: ${p.id}`)
    }
  }

  // ── PASO 3: Determinar caso y actuar ──────────────────────────────
  const ownerEmails = owners.map((o: any) => o.emailAddress)
  const saIsOwner = ownerEmails.includes(saEmail)

  console.log('\n' + '─'.repeat(60))

  if (saIsOwner) {
    console.log('\n[CASO A] La Service Account ES el owner del Sheet.')
    console.log(`  → Añadiendo ${IVAN_EMAIL} como writer...`)

    // Verificar si Ivan ya tiene acceso
    const ivanAlreadyHasAccess = permissions.some(
      (p: any) => p.emailAddress === IVAN_EMAIL
    )
    if (ivanAlreadyHasAccess) {
      const existing = permissions.find((p: any) => p.emailAddress === IVAN_EMAIL)
      console.log(`  → ${IVAN_EMAIL} ya tiene acceso (rol: ${existing.role}). Sin cambios.`)
      process.exit(0)
    }

    try {
      const permRes = await drive.permissions.create({
        fileId: SHEET_ID,
        requestBody: {
          type: 'user',
          role: 'writer',
          emailAddress: IVAN_EMAIL,
        },
        sendNotificationEmail: false,
        supportsAllDrives: true,
      })
      console.log(`\n  [OK] Permiso creado:`)
      console.log(`    - email: ${IVAN_EMAIL}`)
      console.log(`    - role:  writer`)
      console.log(`    - permissionId: ${permRes.data.id}`)
      console.log('\n  El Sheet ahora aparecerá en "Compartido conmigo" del Drive de Ivan.')
      console.log(`  Link directo: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`)
    } catch (err: any) {
      const status = err?.response?.status
      const message = err?.response?.data?.error?.message ?? err?.message
      console.error(`\n  [ERROR al crear permiso — ${status}]: ${message}`)
    }
  } else if (ownerEmails.length === 0) {
    console.log('\n[INDETERMINADO] No se pudo obtener la lista de owners.')
    console.log('  El archivo puede estar en un Shared Drive donde no se expone el campo "owners".')
    console.log('  Intentar acceder al Sheet directamente:')
    console.log(`  https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`)
  } else {
    console.log('\n[CASO B] El owner NO es la Service Account.')
    console.log(`  Owner(s): ${ownerEmails.join(', ')}`)
    console.log('  No se realizan cambios automáticos.')
    console.log('  Ivan debería contactar al owner para que le comparta el Sheet.')
  }
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
