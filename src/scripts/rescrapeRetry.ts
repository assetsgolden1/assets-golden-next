import puppeteer from 'puppeteer'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Solo las 2 que fallaron por timeout
const RETRY_URLS = [
  'https://assetsgolden.com/property/b6ac7d67-42ff-4370-8686-17bd20f93c66',
  'https://assetsgolden.com/property/57673ada-31d4-4ac8-b2b6-bbf324f8420f',
]

async function rescrapeRetry() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let updated = 0
  let errors = 0

  for (const url of RETRY_URLS) {
    const externalId = url.split('/property/')[1]
    console.log(`\nScrapeando (retry): ${externalId.slice(0, 8)}...`)

    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    try {
      // Timeout extendido a 60s y domcontentloaded para páginas lentas
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      })

      await page.waitForSelector('p.text-gold', {
        timeout: 20000,
      }).catch(() => {})

      await new Promise(r => setTimeout(r, 5000))

      const data = await page.evaluate(() => {
        const priceEl = document.querySelector('p.text-3xl.font-display.text-gold')
        const priceText = priceEl?.textContent?.trim() ?? ''

        const allDescs = Array.from(
          document.querySelectorAll('p.text-muted-foreground.leading-relaxed')
        ).map(el => el.textContent?.trim() ?? '')
          .filter(t => t.length > 100)
          .sort((a, b) => b.length - a.length)

        return {
          priceText,
          description: allDescs[0] ?? '',
        }
      })

      const priceClean = data.priceText.replace(/[^\d]/g, '')
      const price = priceClean ? parseInt(priceClean) : null
      const currency = data.priceText.includes('$') ? 'USD' : data.priceText.includes('€') ? 'EUR' : 'USD'

      console.log(`  Precio: ${data.priceText} → ${price} ${currency}`)
      console.log(`  Descripción: ${data.description.length} chars`)

      const updateData: Record<string, unknown> = {}
      if (price) { updateData.price = price; updateData.currency = currency }
      if (data.description && data.description.length > 50) updateData.description = data.description

      if (Object.keys(updateData).length === 0) {
        console.log(`  ⚠️  Sin datos válidos`)
        errors++
        continue
      }

      const { error } = await supabaseAdmin
        .from('properties')
        .update(updateData)
        .eq('external_id', externalId)

      if (error) {
        console.error(`  ✗ ${error.message}`)
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
  console.log(`\n📊 RETRY: ${updated}/2 actualizadas, ${errors} errores`)
  return { updated, errors }
}

rescrapeRetry().then(r => {
  console.log('\n✅ Listo:', r)
  process.exit(0)
}).catch(err => {
  console.error('\n❌', err)
  process.exit(1)
})
