import { translateCountry } from '@/lib/utils/translateGeography'

// Países servidos (nombres canónicos en español). Se traducen según el
// locale vía translateCountry(): en EN salen en inglés, en ES en español.
const SERVED_COUNTRIES = [
  'Argentina',
  'Costa Rica',
  'Ecuador',
  'Emiratos Árabes Unidos',
  'España',
  'Estados Unidos',
  'Grecia',
  'Indonesia',
  'México',
  'Paraguay',
  'Reino Unido',
  'República Dominicana',
]

function buildSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'RealEstateAgent'],
        '@id': 'https://assetsgolden.com/#organization',
        name: 'Assets Golden',
        legalName: 'COVA FUMADA GROUP, SOCIEDAD LIMITADA',
        taxID: 'B05380886',
        url: 'https://assetsgolden.com',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://assetsgolden.com/#logo',
          url: 'https://assetsgolden.com/logo.png',
          contentUrl: 'https://assetsgolden.com/logo.png',
          width: 500,
          height: 500,
        },
        image: { '@id': 'https://assetsgolden.com/#logo' },
        telephone: '+34611853001',
        email: 'hola@assetsgolden.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'José Agustín Goytisolo, 31, L5',
          postalCode: '08970',
          addressLocality: 'Sant Joan Despí',
          addressRegion: 'Cataluña',
          addressCountry: 'ES',
        },
        areaServed: SERVED_COUNTRIES.map((country) => ({
          '@type': 'Country',
          name: translateCountry(country, locale),
        })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Propiedades exclusivas en venta',
          numberOfItems: 2364,
        },
        sameAs: [
          'https://www.linkedin.com/company/assets-golden/',
          'https://www.fotocasa.es/es/inmobiliaria-assets-golden-international-real-estate-consulting/comprar/inmuebles/espana/todas-las-zonas/l?clientId=9202776098940&publisherId=2e46de12-5bb4-4fa3-b91d-2d768640e918',
          'https://www.instagram.com/assetsgolden.consulting/',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://assetsgolden.com/#website',
        url: 'https://assetsgolden.com',
        name: 'Assets Golden',
        description: 'Inmobiliaria Internacional de Propiedades Exclusivas',
        publisher: { '@id': 'https://assetsgolden.com/#organization' },
        inLanguage: 'es-ES',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://assetsgolden.com/propiedades?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

export default function GlobalSchemaOrg({ locale = 'es' }: { locale?: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema(locale)) }}
    />
  )
}
