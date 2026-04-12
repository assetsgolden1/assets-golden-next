import { createClient } from '@supabase/supabase-js'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'

const SUPABASE_URL = 'https://mromkwpqrxpxbbxhdofs.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Crear bucket si no existe
const { error: bucketError } = await supabase.storage.createBucket('hero-images', {
  public: true,
  allowedMimeTypes: ['image/jpeg', 'image/jpg'],
})
if (bucketError && !bucketError.message.includes('already exists')) {
  console.error('❌ Error creando bucket:', bucketError.message)
  process.exit(1)
}
console.log('✅ Bucket hero-images listo\n')

const heroDir = './public/hero'
const files = await readdir(heroDir)
const urls = []

for (const file of files) {
  if (!file.endsWith('.jpg') || file.includes('-bak')) continue

  const buffer = await readFile(join(heroDir, file))

  const { error } = await supabase.storage
    .from('hero-images')
    .upload(file, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) {
    console.error(`❌ ${file}:`, error.message)
    continue
  }

  const { data } = supabase.storage
    .from('hero-images')
    .getPublicUrl(file)

  urls.push({ file, url: data.publicUrl })
  console.log(`✅ ${file} → ${data.publicUrl}`)
}

console.log('\n--- URLs para HeroImageCarousel.tsx ---')
for (const { file, url } of urls) {
  console.log(`  { src: '${url}', alt: '...' },`)
}
