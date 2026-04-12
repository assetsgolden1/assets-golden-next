import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join } from 'path'

const heroDir = './public/hero'
const files = await readdir(heroDir)

for (const file of files) {
  if (!file.endsWith('.jpg') || file.includes('-opt') || file.includes('-bak')) continue
  const input = join(heroDir, file)
  const output = join(heroDir, file.replace('.jpg', '-opt.jpg'))

  await sharp(input)
    .resize(1440, 810, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({
      quality: 65,
      progressive: true,
      mozjpeg: true
    })
    .toFile(output)

  const { default: fs } = await import('fs')
  const stat = fs.statSync(output)
  const kb = Math.round(stat.size / 1024)
  console.log(`✅ ${file} → ${kb}KB`)
}

console.log('\nDone.')
