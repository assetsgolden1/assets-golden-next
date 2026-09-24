/**
 * Genera el PDF del manual de Inmoges para el cliente a partir de la plantilla HTML.
 *
 * Usa el Chrome del sistema vía puppeteer-core: en local no hace falta descargar nada
 * y el resultado es idéntico al que produce la web para los dossieres de propiedad.
 *
 * Uso: npx tsx scripts/pdf/buildManual.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const TEMPLATE = 'scripts/pdf/manual-inmoges.html'
const OUT = 'docs/Manual-Inmoges-AssetsGolden.pdf'

const CHROMES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

async function main() {
  const chrome = CHROMES.find(existsSync)
  if (!chrome) throw new Error('No se encontró Chrome ni Edge para generar el PDF')

  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  const logo = `data:image/png;base64,${readFileSync('public/logo.png').toString('base64')}`
  const html = readFileSync(TEMPLATE, 'utf8').replace('LOGO_SRC', logo).replace('FECHA_DOC', fecha)

  const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.pdf({
      path: OUT,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="width:100%;font-family:Arial,sans-serif;font-size:8pt;color:#8a949e;padding:0 16mm;">' +
        '<span style="float:right"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      margin: { top: '18mm', bottom: '16mm', left: '16mm', right: '16mm' },
    })
  } finally {
    await browser.close()
  }
  console.log(`PDF generado: ${OUT}`)
}

main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
