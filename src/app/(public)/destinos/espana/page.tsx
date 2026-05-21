import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowLeft } from 'lucide-react'
import Breadcrumb from '@/components/seo/Breadcrumb'
import {
  getDestinationBySlug,
  getPropertiesForSpain,
  getPropertyTypesForSpain,
} from '@/lib/supabase/queries'
import {
  ZONE_SLUGS,
  getCitiesInZone,
} from '@/lib/constants/spainZones'
import { SpainFilters } from '@/components/SpainFilters'
import { SpainPropertiesGrid } from '@/components/SpainPropertiesGrid'

export const revalidate = 3600

interface Props {
  searchParams: Promise<{
    zona?: string
    ciudad?: string
    tipo?: string
    precio_min?: string
    precio_max?: string
    habitaciones?: string
    orden?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const zoneName = params.zona ? ZONE_SLUGS[params.zona] : null
  const ciudad = params.ciudad ?? null

  let title = 'Propiedades en España'
  let description = 'Explore la selección de propiedades de lujo en España: villas en la costa, áticos en Barcelona y apartamentos en los destinos más exclusivos del país.'

  if (zoneName && ciudad) {
    title = `Propiedades en ${ciudad}, ${zoneName}`
    description = `Apartamentos, villas y áticos de lujo en ${ciudad}, ${zoneName}. Selección exclusiva y asesoramiento experto para compradores nacionales e internacionales.`
  } else if (zoneName) {
    title = `Propiedades en ${zoneName}`
    description = `Las mejores propiedades de lujo en ${zoneName}: villas, apartamentos y áticos en ubicaciones privilegiadas. Asesoramiento personalizado en cada búsqueda.`
  }

  return {
    title,
    description,
    alternates: {
      canonical: '/destinos/espana',
    },
    openGraph: { title, description, url: '/destinos/espana' },
  }
}

export default async function EspanaPage({ searchParams }: Props) {
  const params = await searchParams

  const zona         = params.zona ?? ''
  const ciudad       = params.ciudad ?? ''
  const tipo         = params.tipo ?? ''
  const precioMin    = params.precio_min ? parseInt(params.precio_min) : null
  const precioMax    = params.precio_max ? parseInt(params.precio_max) : null
  const habitaciones = params.habitaciones ? parseInt(params.habitaciones) : null
  const orden        = (params.orden as 'reciente' | 'precio_asc' | 'precio_desc') ?? 'reciente'
  const page         = Math.max(1, parseInt(params.page ?? '1'))
  const limit        = 24
  const offset       = (page - 1) * limit

  const zoneName = zona ? ZONE_SLUGS[zona] : undefined

  const [{ data: destination }, { data: properties, count }, types] = await Promise.all([
    getDestinationBySlug('espana'),
    getPropertiesForSpain({
      zona: zoneName,
      ciudad: ciudad || undefined,
      tipo: tipo || undefined,
      precioMin,
      precioMax,
      habitaciones,
      orden,
      limit,
      offset,
    }),
    getPropertyTypesForSpain(),
  ])

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / limit)

  const citiesForFilter = zona && zoneName
    ? getCitiesInZone(zoneName).sort()
    : []

  const marketInfo = (destination?.market_info ?? {}) as {
    avgPrice?: string
    rentalYield?: string
    priceGrowth?: string
  }

  const currentFilters = { zona, ciudad, tipo, precioMin, precioMax, habitaciones, orden }

  return (
    <>
      <Breadcrumb
        variant="secondary"
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Destinos', url: '/destinos' },
          { name: 'España', url: '/destinos/espana' },
          ...(zona && zoneName ? [{ name: zoneName, url: `/destinos/espana?zona=${zona}` }] : []),
          ...(ciudad ? [{ name: ciudad, url: `/destinos/espana?${zona ? `zona=${zona}&` : ''}ciudad=${encodeURIComponent(ciudad)}` }] : []),
        ]}
      />

      {/* Hero */}
      <section className="relative h-80 md:h-[420px] overflow-hidden">
        {destination?.hero_image_url ? (
          <Image
            src={destination.hero_image_url}
            alt="España"
            fill
            unoptimized
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 gradient-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent" />

        <div className="relative container-luxury h-full flex flex-col justify-end pb-12">
          <Link
            href="/destinos"
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a Destinos
          </Link>
          <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-3">
            <MapPin className="h-4 w-4" />
            <span>Destino de inversión</span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl lg:text-6xl leading-tight">
            {zoneName && ciudad
              ? `${ciudad}, ${zoneName}`
              : zoneName
              ? `España — ${zoneName}`
              : 'España'}
          </h1>
          {destination?.tagline && !zona && (
            <p className="mt-3 text-white/70 text-base max-w-xl leading-relaxed">
              {destination.tagline}
            </p>
          )}
          <p className="mt-4 inline-flex items-center gap-2 text-gold text-sm font-medium">
            <span className="h-px w-8 bg-gold" />
            {totalCount.toLocaleString('es-ES')} {totalCount === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
          </p>
        </div>
      </section>

      {/* Stats mercado */}
      {!zona && (marketInfo.avgPrice || marketInfo.rentalYield || marketInfo.priceGrowth) && (
        <section className="bg-gold py-6 w-full overflow-hidden">
          <div className="container-luxury">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {marketInfo.avgPrice && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.avgPrice}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">Precio medio</p>
                </div>
              )}
              {marketInfo.rentalYield && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.rentalYield}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">Rentabilidad</p>
                </div>
              )}
              {marketInfo.priceGrowth && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.priceGrowth}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">Crecimiento</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contenido editorial — visible solo en vista general, sin filtro de zona */}
      {!zona && (
        <section className="section-padding bg-muted/30">
          <div className="container-luxury">
            <article className="max-w-3xl mx-auto">

              {/* Panorama */}
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
                España: panorama del mercado inmobiliario de lujo
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  España ocupa una posición consolidada entre los destinos preferidos del
                  comprador internacional de alto patrimonio. La combinación de un marco
                  jurídico europeo estable, una infraestructura de servicios de primer nivel
                  y una diversidad geográfica sin equivalente en el Mediterráneo occidental
                  explica la demanda sostenida que registra el segmento residencial de lujo
                  a lo largo de sus costas y principales ciudades.
                </p>
                <p>
                  El mercado español atrae perfiles de comprador diferenciados. Por un lado,
                  la adquisición de segunda residencia por compradores europeos —principalmente
                  del norte de Europa y el Reino Unido— que priorizan calidad de vida con
                  conexión directa a sus países de origen. Por otro, el inversor latinoamericano
                  y de Oriente Medio que ve en España una plataforma de entrada a Europa con
                  exposición a un mercado inmobiliario maduro y con liquidez contrastada.
                </p>
                <p>
                  En todos los mercados de lujo españoles, la oferta de producto verdaderamente
                  exclusivo —villas frente al mar, áticos en primera línea de playa, obra nueva
                  con especificaciones premium— presenta una escasez estructural que sostiene
                  la demanda a largo plazo.
                </p>
              </div>

              <div className="h-px w-12 bg-gold my-10" />

              {/* Zonas costeras */}
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
                Las principales zonas costeras de lujo
              </h2>
              <div className="space-y-8">

                <div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    <Link
                      href="/destinos/espana?zona=costa-del-sol"
                      className="hover:text-gold transition-colors"
                    >
                      Costa del Sol
                    </Link>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    La Costa del Sol concentra el mayor volumen de transacciones premium del
                    litoral español.{' '}
                    <Link
                      href="/destinos/espana?zona=costa-del-sol&ciudad=Marbella"
                      className="text-gold hover:underline"
                    >
                      Marbella
                    </Link>
                    , Benahavís y Estepona configuran el epicentro, con una combinación de
                    proyectos de obra nueva de alto standing, complejos de golf consolidados
                    y una infraestructura de servicios —náutica, gastronomía, educación
                    internacional— que acompaña el nivel de la oferta residencial. La demanda
                    procede principalmente de compradores del norte de Europa, el Reino Unido
                    y el Oriente Medio.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    <Link
                      href="/destinos/espana?zona=costa-blanca"
                      className="hover:text-gold transition-colors"
                    >
                      Costa Blanca
                    </Link>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    La Costa Blanca ofrece un espectro amplio dentro del lujo. El norte
                    —Jávea, Moraira, Altea— atrae a un comprador europeo que valora la
                    privacidad y el entorno natural sobre la concentración de servicios. El
                    sur presenta mayor diversidad de producto y acceso, con propiedades en
                    primera línea cuyo precio de entrada es comparativamente inferior al de
                    la Costa del Sol, lo que genera oportunidades para perfiles inversores
                    con visión de medio plazo.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    <Link
                      href="/destinos/espana?zona=cataluna"
                      className="hover:text-gold transition-colors"
                    >
                      Cataluña
                    </Link>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Barcelona mantiene una demanda activa en los rangos más altos del mercado
                    urbano, impulsada por compradores internacionales atraídos por su dimensión
                    económica y cultural. En el litoral, la Costa Brava —con Begur, Cadaqués y
                    Palafrugell como referentes— ofrece un segmento con oferta restringida:
                    propiedades singulares con escasez de producto nuevo, factores que el
                    comprador de largo plazo valora expresamente.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    <Link
                      href="/destinos/espana?zona=islas-baleares"
                      className="hover:text-gold transition-colors"
                    >
                      Islas Baleares
                    </Link>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    El archipiélago opera en una categoría propia. La normativa de protección
                    medioambiental limita el suelo disponible para desarrollo, generando una
                    presión sostenida sobre el stock existente. Ibiza concentra el perfil más
                    internacional y de mayor capacidad adquisitiva del Mediterráneo; Mallorca
                    presenta un mercado más diversificado, desde el comprador familiar hasta
                    el inversor institucional; Menorca se distingue por su discreción y la
                    preservación de un entorno natural excepcional.
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-xl font-semibold mb-3">
                    <Link
                      href="/destinos/espana?zona=costa-de-la-luz"
                      className="hover:text-gold transition-colors"
                    >
                      Costa de la Luz
                    </Link>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    La Costa de la Luz —con Sotogrande como referente histórico de lujo en la
                    provincia de Cádiz— ofrece un segmento caracterizado por menor presión
                    urbanística respecto al litoral mediterráneo. Las fincas con amplias
                    parcelas, las propiedades singulares y los desarrollos de polo, golf y
                    náutica mantienen su atractivo para un comprador que prioriza la
                    exclusividad y la privacidad sobre la concentración de servicios.
                  </p>
                </div>

              </div>

              <div className="h-px w-12 bg-gold my-10" />

              {/* Marco legal */}
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
                Marco legal para compradores internacionales
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  La adquisición de inmuebles en España por ciudadanos extranjeros no está
                  sujeta a restricciones de nacionalidad en el mercado libre. El proceso
                  requiere la obtención previa del Número de Identificación de Extranjero
                  (NIE), gestionable desde el consulado español en el país de residencia o
                  directamente en territorio español.
                </p>
                <p>
                  La fiscalidad de la compra varía según el tipo de inmueble: la obra nueva
                  tributa por IVA (al 10% en uso residencial) más el Impuesto sobre Actos
                  Jurídicos Documentados; la segunda mano, por el Impuesto de Transmisiones
                  Patrimoniales, cuyo tipo varía según la comunidad autónoma donde se ubique
                  el inmueble.
                </p>
                <p>
                  <strong className="font-semibold text-foreground">Importante:</strong> el
                  programa de Visa de Oro por inversión inmobiliaria fue derogado por la Ley
                  Orgánica 1/2025, en vigor desde abril de 2025. Para compradores no
                  comunitarios que buscaban residencia mediante esta vía, existen alternativas
                  (Visa de Inversor en proyectos empresariales, Visa de Nómada Digital,
                  residencia no lucrativa) que un asesor legal especializado puede valorar
                  caso por caso.{' '}
                  <Link
                    href="/blog/golden-visa-espana-2026-residencia-comprando-propiedad"
                    className="text-gold hover:underline"
                  >
                    Puede consultarse un análisis detallado en nuestro artículo sobre la
                    Golden Visa España 2026.
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
                  La información contenida en este apartado es de carácter general e
                  informativo. No constituye asesoramiento fiscal ni legal. Para operaciones
                  concretas, consulte con un abogado especializado en derecho inmobiliario
                  español.
                </p>
              </div>

              <div className="h-px w-12 bg-gold my-10" />

              {/* Por qué España */}
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
                ¿Por qué España?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Más allá de las condiciones del mercado, España ofrece factores estructurales
                que explican la fidelidad del comprador internacional al destino:
              </p>
              <dl className="space-y-5">
                <div>
                  <dt className="font-semibold text-foreground">Conectividad.</dt>
                  <dd className="text-muted-foreground leading-relaxed mt-1">
                    Los aeropuertos de Madrid, Barcelona, Málaga, Palma de Mallorca y Alicante
                    operan con rutas directas a los principales destinos europeos y
                    transatlánticos, con frecuencias que permiten gestionar una agenda
                    internacional sin fricciones de movilidad.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Seguridad jurídica.</dt>
                  <dd className="text-muted-foreground leading-relaxed mt-1">
                    Como Estado miembro de la Unión Europea, España ofrece un marco de
                    protección de derechos de propiedad alineado con los estándares del
                    mercado continental y una trazabilidad registral consolidada.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Infraestructura de servicios.</dt>
                  <dd className="text-muted-foreground leading-relaxed mt-1">
                    Las principales zonas de lujo cuentan con una red de colegios
                    internacionales, clínicas privadas, marinas, campos de golf de referencia y
                    restauración de nivel que permite un estándar de vida sin concesiones.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Comunidad internacional establecida.</dt>
                  <dd className="text-muted-foreground leading-relaxed mt-1">
                    Los principales destinos de lujo en España cuentan con comunidades de
                    residentes extranjeros consolidadas desde hace décadas, lo que reduce
                    significativamente la curva de adaptación para nuevos compradores
                    internacionales.
                  </dd>
                </div>
              </dl>

            </article>
          </div>
        </section>
      )}

      {/* Layout filtros + grid */}
      <section className="container-luxury py-12">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
          <SpainFilters
            zones={Object.entries(ZONE_SLUGS)}
            cities={citiesForFilter}
            types={types}
            currentFilters={currentFilters}
          />

          <SpainPropertiesGrid
            properties={properties ?? []}
            totalCount={totalCount}
            currentPage={page}
            totalPages={totalPages}
            currentFilters={currentFilters}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">Asesoría gratuita</p>
          <h2 className="font-display text-2xl font-semibold text-white mb-4 md:text-3xl">
            ¿Le interesa invertir en España?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Nuestros especialistas le asesorarán sobre las mejores oportunidades y aspectos legales.
          </p>
          <Link href="/contacto" className="btn-gold rounded-lg px-6 py-3 text-sm font-medium">
            Solicitar información
          </Link>
        </div>
      </section>
    </>
  )
}
