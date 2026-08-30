/**
 * translateCerveraExcerpts — backfill puntual (27/08/2026)
 *
 * Cervera publica el copy editorial de la mayoría de sus promociones SOLO en
 * inglés. Tras `enrichCerveraDescriptions` quedaban 18 fichas con descripción
 * española corta: 14 tenían texto inglés traducible y 4 no tenían nada.
 *
 * Estas son esas traducciones, hechas a mano y fieles al original (no se inventa
 * ni una cifra ni un servicio). Se antepone al texto factual ya existente.
 *
 * EXCLUIDA a propósito: `cv-3463` (Ziggurat). Su "descripción" en la fuente no
 * habla de la promoción sino de qué es un zigurat mesopotámico — traducirlo
 * añadiría texto irrelevante a la ficha. Queda corta a propósito.
 *
 * Uso:
 *   npx tsx --env-file=.env.local src/scripts/translateCerveraExcerpts.ts          → dry-run
 *   npx tsx --env-file=.env.local src/scripts/translateCerveraExcerpts.ts --apply  → escribe
 */
const APPLY = process.argv.includes('--apply')

const TRADUCCIONES: Record<string, string> = {
  'cv-3500':
    'Hollywood Beach: un refugio costero muy codiciado. Situada entre Miami Beach y Fort Lauderdale, Hollywood Beach ofrece un ritmo más pausado y con más carácter, con su icónico Ocean Broadwalk, dunas preservadas y ese encanto nostálgico del art déco.',
  'cv-3332':
    'Vida sin preocupaciones, diseño inspirado y una ejecución de calidad se dan cita en Alana Bay Harbor Islands. La obra nueva, los materiales y acabados de gama alta y el cuidado impecable por el detalle se aprecian desde la primera mirada y se extienden a cada elemento del edificio y de las residencias. El resultado es una vivienda que no solo es hermosa a la vista, sino profundamente disfrutable.',
  'cv-3504':
    'En el sereno enclave de Bay Harbor Islands, Pool Haus reúne una colección limitada de dieciocho amplias residencias pensada para quien valora el lujo y un confort sin comparación. Cada distribución es un ejercicio de diseño meditado, con plantas espaciosas que combinan una estética moderna con un encanto atemporal. Desde los salones bañados de luz hasta los exquisitos baños principales, cada elemento está trabajado con esmero para transmitir tranquilidad y privacidad.',
  'cv-3335':
    'Alhambra Parc es una comunidad residencial de estilo boutique en pleno corazón de Coral Gables. Las viviendas ofrecen plantas amplias con acabados modernos, cocinas actualizadas, electrodomésticos de acero inoxidable y lavadero en la propia vivienda. Cada apartamento cuenta además con balcón o patio privado, para disfrutar del entorno tranquilo y arbolado. Su ubicación privilegiada junto a Miracle Mile deja la restauración, las compras y el ocio a pocos minutos.',
  'cv-3458':
    'Opus Coconut Grove es una residencia de lujo de estilo boutique, recogida en uno de los barrios más frondosos e históricos de Miami. Concebido con elegancia y privacidad, el edificio reúne apenas un puñado de viviendas exclusivas que combinan diseño contemporáneo con materiales cálidos y naturales. Cada residencia tiene un carácter diáfano y luminoso, con grandes ventanales que invitan a entrar al verde del entorno. Los interiores están cuidados con acabados refinados, electrodomésticos de gama alta y acceso por ascensor privado. El ambiente es sereno y sofisticado, con servicios que lo convierten en un verdadero refugio: piscina y lounge en la azotea, spa con baño de vapor y sauna, y un tranquilo gimnasio. A pocos pasos de los parques, puertos deportivos y cafés al aire libre de Coconut Grove, es ideal para quien busca un lujo discreto en una comunidad caminable y arbolada.',
  'cv-3488':
    'Bay Harbor Towers es una colección boutique de cuarenta y cuatro residencias privadas que lleva la vida de lujo en la isla a otro nivel. En la costa norte, donde el frente marítimo de Indian Creek se encuentra con la amplitud de Biscayne Bay, esta pieza arquitectónica destaca como un referente de exclusividad.',
  'cv-3213':
    'Shoma Bay es una torre de 24 plantas con 333 viviendas en la que el diseño funde con naturalidad una estética art déco clásica con una fachada contemporánea, sumando servicios pensados para la comunidad: jardín zen, sala de recepción de la compra, bodega, salón de puros y otras propuestas. Recogido en North Bay Village y a resguardo del ritmo acelerado de Miami, Shoma Bay es el primero de su clase: un lugar para vivir y disfrutar con lujo, diseñado para quienes quieren integrar vida, trabajo, bienestar y ocio.',
  'cv-3326':
    'Colección limitada de solo 23 residencias de lujo frente al agua, de dos, tres y cuatro dormitorios, con amarre privado, en la codiciada Bay Harbor Island de Miami.',
  'cv-91':
    'Natiivo Fort Lauderdale es la primera propiedad residencial y hotelera llave en mano de Fort Lauderdale. Diseñada, construida y licenciada expresamente para el alquiler de corta estancia, ofrece una fórmula de vivienda compartida que permite a los propietarios una forma inteligente de invertir.',
  'cv-3341':
    'Aria Reserve levanta el conjunto de torres residenciales frente al agua más altas de Estados Unidos. Su perfil icónico en pleno corazón de Miami y su prestigiosa posición sobre Biscayne Bay hacen que Aria Reserve se sienta como una finca privada, a resguardo del resto del mundo.',
  'cv-3424':
    'Una colección boutique de 8 viviendas ultra exclusivas a pie de playa, donde Miami Beach se encuentra con Surfside. Diseñadas por el reconocido arquitecto René Gonzalez, estas residencias reinterpretan la clásica casa de piedra rojiza para la vida costera, priorizando la luz natural, la continuidad entre interior y exterior y unos materiales elegantes.',
  'cv-3420':
    'Solo nueve viviendas exclusivas frente al agua, con Yacht Club y marina privada de uso exclusivo para los residentes. Ejecutadas con un cuidado por el detalle sin precedentes por un equipo de diseñadores, arquitectos e ingenieros de reconocido prestigio nacional. Cada residencia disfruta de frente al agua, con vistas al mar, al campo de golf y a la ciudad.',
  'cv-3409':
    'The Links at Fisher Island ofrece una colección exclusiva de viviendas de lujo junto a un campo de golf inmaculado, combinando una vida de estilo resort con vistas espectaculares, servicios de primer nivel y una privacidad sin igual en una de las comunidades de isla privada más prestigiosas de Miami.',
}

async function main() {
  const { createClient } = await import('@supabase/supabase-js')
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const ids = Object.keys(TRADUCCIONES)
  const { data: rows, error } = await supa
    .from('properties')
    .select('id, slug, external_id, description')
    .in('external_id', ids)
  if (error) throw error

  let changed = 0
  for (const row of rows ?? []) {
    const es = TRADUCCIONES[row.external_id as string]
    const cur = (row.description as string | null) ?? ''
    if (!es || cur.includes(es.slice(0, 50))) continue // idempotente

    const next = `${es}\n\n${cur}`.trim()
    changed++
    console.log(`• ${row.slug}  ${cur.length}→${next.length}`)
    if (APPLY) {
      const { error: upErr } = await supa.from('properties').update({ description: next }).eq('id', row.id)
      if (upErr) throw new Error(`fallo en ${row.slug}: ${upErr.message}`)
    }
  }
  console.log(`\n${APPLY ? 'APLICADO' : 'DRY-RUN'} — ${changed} fichas traducidas de ${ids.length}.`)
  if (!APPLY && changed) console.log('Volvé a ejecutar con --apply para escribir.')
}

main().catch((e) => { console.error(e); process.exit(1) })

// Marca el archivo como módulo: sin imports/exports, TS lo trata como script
// global y `APPLY`/`main` chocarían con los de los otros scripts.
export {}
