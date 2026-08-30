/**
 * fixTeamBiosEn — backfill puntual (27/08/2026)
 *
 * Tras la revisión de perfiles del equipo, dos fichas activas tenían el inglés
 * desalineado con el español:
 *
 *  - Atilio Miguel Montironi (co-fundador): el `bio_en` era un texto ANTIGUO y
 *    completamente distinto (303 chars, hablaba de "retail y tecnología") frente
 *    a una biografía nueva en primera persona de 2.432 chars. No era una
 *    traducción incompleta: era otro contenido.
 *  - Ana Serrat (partner Miami–Fort Lauderdale): `bio_en` y `role_en` en NULL,
 *    así que su ficha en inglés salía vacía.
 *
 * Las traducciones son fieles al español: no se añade ni se quita información.
 *
 * Uso:
 *   npx tsx --env-file=.env.local src/scripts/fixTeamBiosEn.ts          → dry-run
 *   npx tsx --env-file=.env.local src/scripts/fixTeamBiosEn.ts --apply  → escribe
 */
const APPLY = process.argv.includes('--apply')

const ATILIO_EN = `A civil engineer, entrepreneur and real estate professional with more than four decades of experience across construction, property development, sales and investment management.

My career began in Latin America, mainly in Argentina and Uruguay, and later expanded to the United States and Europe. I have been based in Barcelona for years, and from here I have taken part in property transactions and investments and developed an increasingly international view of the sector.

Over the course of my career I have come to know real estate from very different angles: as a builder, designer, developer, sales agent, investment manager and adviser. That experience taught me that a good property transaction does not begin with a property, but with the ability to understand what each person needs, identify the right opportunity and see it through with professional judgement.

I am also a firm believer in innovation applied to the property sector. I have worked on projects involving energy efficiency, sustainability and new technologies, complementing my professional experience with continuous training, postgraduate studies and specialisation in renewable energy.

Assets Golden was born out of that career and one very specific conviction.

We created Assets Golden to build a different kind of international property consultancy: a company able to connect people, capital and opportunities across different markets around the world, with an independent perspective and close, personal support.

Today we work on property opportunities in Spain and in international markets, bringing our clients residential projects, investments, new developments and selected assets, while building relationships with developers, investors and professionals in different countries.

My role within Assets Golden is focused in particular on strategic vision, business development, international relations and the creation of new opportunities and partnerships.

After so many years in this sector I still hold to the same philosophy:

real estate is not simply about buying and selling properties; it is about connecting the right people with the right opportunity, at the right time.

That is the spirit in which Assets Golden was born, and the one that continues to guide our growth.`

const ANA_EN = `An Argentine businesswoman based in the United States, with more than 20 years of experience in the corporate world.
Founder and CEO of Interbloom Group
Business and Real Estate Agent
Strategic Adviser to international investors, entrepreneurs and families entering the US market
Administrative Manager with extensive experience in the telecommunications sector. A professional with solid operational skills in the public sector, negotiation, business strategy, telecommunications and sales management.

At Interbloom Group we work in an integrated way alongside a team of professionals with more than 25 years of experience based in the United States — commercial law, immigration law, tax (CPA) and finance (lending to foreign clients) — supporting entrepreneurs, investors and families through their investment, expansion and relocation processes in the United States.

Our approach is strategic and 360°, avoiding a fragmented set of advisers and ensuring that every decision is aligned with a solid, long-term plan.`

const CAMBIOS: Array<{ name: string; bio_en: string; role_en?: string }> = [
  { name: 'Atilio Miguel Montironi', bio_en: ATILIO_EN },
  // El rol es un ámbito geográfico, no un cargo: se deja igual en ambos idiomas.
  { name: 'ANA SERRAT', bio_en: ANA_EN, role_en: 'MIAMI - FORT LAUDERDALE' },
]

async function main() {
  const { createClient } = await import('@supabase/supabase-js')
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  for (const c of CAMBIOS) {
    const { data: rows, error } = await supa
      .from('team_members')
      .select('id, name, bio_es, bio_en, role_en')
      .eq('name', c.name)
    if (error) throw error
    if (!rows?.length) { console.log(`  ⚠ no encontrado: ${c.name}`); continue }

    const row = rows[0]
    const antesBio = (row.bio_en as string | null)?.length ?? 0
    const largoEs = (row.bio_es as string | null)?.length ?? 0

    console.log(`• ${row.name}`)
    console.log(`   ES ${largoEs} chars · EN ${antesBio} → ${c.bio_en.length}`)
    if (c.role_en) console.log(`   role_en: ${row.role_en ?? '(vacío)'} → ${c.role_en}`)

    if (APPLY) {
      const patch: Record<string, string> = { bio_en: c.bio_en }
      if (c.role_en) patch.role_en = c.role_en
      const { error: upErr } = await supa.from('team_members').update(patch).eq('id', row.id)
      if (upErr) throw new Error(`fallo en ${row.name}: ${upErr.message}`)
    }
  }

  console.log(`\n${APPLY ? 'APLICADO' : 'DRY-RUN'} — ${CAMBIOS.length} perfiles.`)
  if (!APPLY) console.log('Volvé a ejecutar con --apply para escribir.')
}

main().catch((e) => { console.error(e); process.exit(1) })

// Marca el archivo como módulo: sin imports/exports, TS lo trata como script
// global y `APPLY`/`main` chocarían con los de los otros scripts.
export {}
