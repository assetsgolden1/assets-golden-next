import { runScraper } from './scrapeOriginalWeb'

runScraper()
  .then(result => {
    console.log('\n✅ Resultado final:')
    console.log(JSON.stringify(result, null, 2))
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Error fatal:', err)
    process.exit(1)
  })
