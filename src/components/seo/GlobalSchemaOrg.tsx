const schema = {
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
      areaServed: [
        { '@type': 'Country', name: 'Argentina' },
        { '@type': 'Country', name: 'Costa Rica' },
        { '@type': 'Country', name: 'Ecuador' },
        { '@type': 'Country', name: 'Emiratos Árabes Unidos' },
        { '@type': 'Country', name: 'España' },
        { '@type': 'Country', name: 'Estados Unidos' },
        { '@type': 'Country', name: 'Grecia' },
        { '@type': 'Country', name: 'Indonesia' },
        { '@type': 'Country', name: 'México' },
        { '@type': 'Country', name: 'Paraguay' },
        { '@type': 'Country', name: 'Reino Unido' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Propiedades de lujo en venta',
        numberOfItems: 2364,
      },
      sameAs: ['https://www.linkedin.com/company/assets-golden/'],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://assetsgolden.com/#website',
      url: 'https://assetsgolden.com',
      name: 'Assets Golden',
      description: 'Inmobiliaria de Lujo Internacional',
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

export default function GlobalSchemaOrg() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
