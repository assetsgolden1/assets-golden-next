import puppeteer from 'puppeteer'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PROPERTY_URLS = [
  'https://assetsgolden.com/property/0a2533a5-f8b0-4f33-a84b-f62abfa9515a',
  'https://assetsgolden.com/property/3f9ff093-ae44-4fa9-9e80-9b7805588d00',
  'https://assetsgolden.com/property/0ad39683-2ebe-46d2-acec-62e0f3430ee2',
  'https://assetsgolden.com/property/735f3a4c-14bd-4e3b-b879-04addeb8b17f',
  'https://assetsgolden.com/property/d79980c6-033d-437d-9676-f4635c2e10f7',
  'https://assetsgolden.com/property/b6ac7d67-42ff-4370-8686-17bd20f93c66',
  'https://assetsgolden.com/property/57673ada-31d4-4ac8-b2b6-bbf324f8420f',
  'https://assetsgolden.com/property/1fcd1123-438e-47e4-9a92-19d7e1b40f4b',
  'https://assetsgolden.com/property/ea3e1eaf-ebb5-4e78-bc30-b70cbf87658e',
]

async function rescrape() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let updated = 0
  let errors = 0

  for (const url of PROPERTY_URLS) {
    const externalId = url.split('/property/')[1]
    console.log(`\nScrapeando: ${externalId.slice(0, 8)}...`)

    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      })

      // Esperar a que cargue el precio (señal de que el SPA terminó)
      await page.waitForSelector('p.text-gold', {
        timeout: 15000,
      }).catch(() => {})

      await new Promise(r => setTimeout(r, 3000))

      const data = await page.evaluate(() => {
        // Selector exacto del precio
        const priceEl = document.querySelector(
          'p.text-3xl.font-display.text-gold'
        )
        const priceText = priceEl?.textContent?.trim() ?? ''

        // Selector exacto de la descripción
        const descEl = document.querySelector(
          'p.text-muted-foreground.leading-relaxed.whitespace-pre-line'
        )
        const description = descEl?.textContent?.trim() ?? ''

        // Backup: si hay múltiples descripciones, tomar la más larga
        const allDescs = Array.from(
          document.querySelectorAll(
            'p.text-muted-foreground.leading-relaxed'
          )
        ).map(el => el.textContent?.trim() ?? '')
          .filter(t => t.length > 100)
          .sort((a, b) => b.length - a.length)

        const bestDesc = allDescs[0] ?? description

        return {
          priceText,
          description: bestDesc,
        }
      })

      // Parsear precio: "$300.000" → 300000
      const priceClean = data.priceText.replace(/[^\d]/g, '')
      const price = priceClean ? parseInt(priceClean) : null

      const currency = data.priceText.includes('$')
        ? 'USD'
        : data.priceText.includes('€')
          ? 'EUR'
          : 'USD'

      console.log(`  Precio: ${data.priceText} → ${price} ${currency}`)
      console.log(`  Descripción: ${data.description.length} chars`)

      if (!price && !data.description) {
        console.log(`  ⚠️  Sin datos válidos, saltando`)
        errors++
        continue
      }

      const updateData: Record<string, unknown> = {}
      if (price) {
        updateData.price = price
        updateData.currency = currency
      }
      if (data.description && data.description.length > 50) {
        updateData.description = data.description
      }

      const { error } = await supabaseAdmin
        .from('properties')
        .update(updateData)
        .eq('external_id', externalId)

      if (error) {
        console.error(`  ✗ Error update: ${error.message}`)
        errors++
      } else {
        updated++
        console.log(`  ✓ Actualizado`)
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err}`)
      errors++
    } finally {
      await page.close()
    }
  }

  await browser.close()

  console.log(`\n📊 RESULTADO:`)
  console.log(`  Actualizadas: ${updated}/9`)
  console.log(`  Errores: ${errors}`)

  return { updated, errors }
}

if (require.main === module) {
  rescrape().then(result => {
    console.log('\n✅ Listo:', result)
    process.exit(0)
  }).catch(err => {
    console.error('\n❌ Error fatal:', err)
    process.exit(1)
  })
}
