import Link from 'next/link'
import type { ReactNode } from 'react'

// ─── Tier 1: México ──────────────────────────────────────────────────────────

function MexicoContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        México: panorama del mercado inmobiliario de lujo
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          México ocupa un lugar singular en la cartografía del lujo latinoamericano.
          La diversidad geográfica del país —costas en dos océanos, ciudades coloniales
          y destinos de playa con proyección internacional— genera un espectro de
          oportunidades que atrae tanto al comprador latinoamericano como al
          norteamericano y europeo en busca de activos en un mercado con régimen
          fiscal propio y dinamismo contrastado.
        </p>
        <p>
          El mercado residencial de lujo en México se concentra en destinos que
          combinan infraestructura turística consolidada, conectividad aérea directa
          y una demanda sostenida por parte de no residentes. El comprador
          internacional que opera en este mercado suele valorar la proximidad
          relativa con Estados Unidos y Canadá, la calidad de los desarrollos de
          obra nueva en destinos costeros y el nivel de vida que ofrece el país a
          una fracción del coste equivalente en mercados europeos comparables.
        </p>
        <p>
          La escasez de producto de primera línea en los destinos consolidados
          —especialmente frente al mar en los corredores más demandados— mantiene
          una presión sostenida sobre la oferta, particularmente en el segmento
          de villas y residencias con acceso privado a la playa.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
        Principales destinos
      </h2>
      <div className="space-y-8">

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Tulum (Quintana Roo)
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Tulum representa uno de los mercados de mayor proyección en el segmento
            premium. La combinación de arquitectura con materiales naturales,
            proximidad a la selva y las playas del Caribe norte ha generado una
            demanda internacional que ha transformado la zona en un destino
            diferenciado respecto al modelo de resort convencional. El corredor
            Tulum-Akumal concentra la mayor densidad de proyectos de alto standing.{' '}
            <Link
              href="/blog/invertir-en-tulum-analisis-2026"
              className="text-gold hover:underline"
            >
              Puede consultarse un análisis detallado del mercado de Tulum en nuestro
              blog.
            </Link>
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Los Cabos (Baja California Sur)
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Los Cabos —la conurbación de San José del Cabo y Cabo San Lucas— es el
            destino de lujo de mayor penetración entre el comprador norteamericano.
            Los complejos residenciales vinculados a campos de golf, la oferta de
            marinas y una infraestructura hotelera de primer nivel explican la
            concentración de producto premium en esta zona del Pacífico mexicano.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Puerto Vallarta y Riviera Nayarit (Jalisco / Nayarit)
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Puerto Vallarta y la Riviera Nayarit configuran un mercado costero con
            una comunidad internacional establecida desde hace décadas. El perfil
            del comprador es diverso: desde la segunda residencia de retiro hasta
            el inversor orientado al mercado de alquiler vacacional de lujo. La
            zona cuenta con acceso directo por el Aeropuerto Internacional Licenciado
            Gustavo Díaz Ordaz.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Ciudad de México
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Ciudad de México alberga un mercado residencial de lujo urbano con
            características propias. Las colonias Polanco, Lomas de Chapultepec,
            Santa Fe y el corredor Roma-Condesa concentran la oferta de apartamentos
            y penthouses premium para un perfil comprador que combina el uso
            personal con la inversión en renta urbana a largo plazo.
          </p>
        </div>

      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Marco legal para compradores extranjeros
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          La regulación más importante que debe conocer el comprador extranjero en
          México es la denominada <strong className="font-semibold text-foreground">Zona
          Restringida</strong>: el territorio comprendido en los 50 kilómetros
          contiguos a las costas y los 100 kilómetros a las fronteras
          internacionales. Dentro de esta zona, la Constitución mexicana impide que
          los extranjeros adquieran propiedades en pleno dominio.
        </p>
        <p>
          La solución legal habitual para que un ciudadano no mexicano adquiera un
          inmueble dentro de la Zona Restringida es el{' '}
          <strong className="font-semibold text-foreground">Fideicomiso</strong>: un
          contrato bancario mediante el cual un banco mexicano actúa como fiduciario
          y el comprador extranjero como fideicomisario con todos los derechos de uso,
          disfrute y disposición del inmueble. Tulum, Los Cabos y Puerto Vallarta se
          encuentran dentro de la Zona Restringida, por lo que esta figura aplica a
          la práctica totalidad del catálogo costero.
        </p>
        <p>
          Fuera de la Zona Restringida —en Ciudad de México, por ejemplo— los
          extranjeros pueden adquirir directamente con escritura pública ante notario,
          sin necesidad de fideicomiso.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. No constituye asesoramiento fiscal ni legal. Para operaciones
          concretas en México, consulte con un notario o abogado especializado en
          derecho inmobiliario mexicano.
        </p>
      </div>
    </>
  )
}

// ─── Tier 1: Indonesia ───────────────────────────────────────────────────────

function IndonesiaContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Indonesia: panorama del mercado inmobiliario de lujo
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Indonesia —y Bali en particular— ocupa un lugar único en el mercado
          inmobiliario de lujo del sudeste asiático. La isla ha evolucionado desde
          un destino turístico convencional hacia un ecosistema residencial con
          atractivo estructural para un perfil de comprador internacional que
          combina la búsqueda de estilo de vida con perspectivas de revalorización
          a largo plazo.
        </p>
        <p>
          El interés internacional por la propiedad en Bali se explica por la
          convergencia de factores difícilmente replicables: un entorno natural de
          excepcional riqueza, una tradición arquitectónica propia que se ha
          integrado con el diseño contemporáneo de alta gama, una infraestructura
          turística en expansión y la llegada de una comunidad de residentes
          internacionales —nómadas digitales, creativos, emprendedores— que ha
          transformado zonas como Canggu en mercados con demanda constante de
          producto premium.
        </p>
        <p>
          El reto central del mercado indonesio para el comprador extranjero es su
          marco legal: Indonesia no permite que ciudadanos extranjeros adquieran
          tierra en pleno dominio. Conocer las estructuras disponibles es
          imprescindible antes de operar en este mercado.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
        Las principales zonas de Bali
      </h2>
      <div className="space-y-8">

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Seminyak y Canggu
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            El corredor Seminyak-Canggu concentra la mayor densidad de producto
            residencial de lujo en Bali. Villas privadas con piscina, diseño
            arquitectónico de autor y proximidad a la costa son los atributos
            definitorios. Canggu ha experimentado una transformación significativa
            en la última década, pasando de zona de surf a destino residencial con
            infraestructura de servicios comparable a la de ciudades europeas de
            tamaño medio.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Ubud
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Ubud representa la vertiente cultural y de bienestar del mercado balinés.
            A diferencia de la costa, ofrece un entorno de selva y arrozales que
            atrae a un comprador que prioriza la privacidad, la naturaleza y la
            experiencia inmersiva. Los retiros de lujo, los spa-resorts residenciales
            y las villas integradas en el paisaje tropical son los productos
            dominantes en este segmento.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Uluwatu y la Península de Bukit
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            La Península de Bukit —con Uluwatu, Ungasan y Bingin como referentes—
            se ha consolidado como el sector de mayor crecimiento en el segmento
            de lujo. Las villas en acantilado con vistas al océano Índico
            representan algunos de los productos más exclusivos del mercado balinés.
            La oferta está orientada principalmente al alquiler vacacional de alta
            gama y a la segunda residencia premium.
          </p>
        </div>

      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Marco legal para compradores extranjeros
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Este apartado requiere atención especial. Indonesia tiene uno de los
          marcos legales más restrictivos de la región para la inversión
          inmobiliaria extranjera, y es fundamental entenderlo antes de comprometerse
          con cualquier operación.
        </p>
        <p>
          Los ciudadanos extranjeros <strong className="font-semibold text-foreground">
          no pueden adquirir tierra en pleno dominio</strong> (<em>hak milik</em>) en
          Indonesia. Las opciones disponibles para el comprador internacional son:
        </p>
        <dl className="space-y-4 mt-2">
          <div>
            <dt className="font-semibold text-foreground">
              Leasehold (Hak Sewa).
            </dt>
            <dd className="text-muted-foreground leading-relaxed mt-1">
              Contrato de arrendamiento de larga duración sobre el inmueble. Es
              la vía más utilizada por el comprador internacional en Bali. Los
              plazos y condiciones se pactan contractualmente.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              Hak Pakai.
            </dt>
            <dd className="text-muted-foreground leading-relaxed mt-1">
              Derecho de uso sobre el suelo, distinto a la propiedad de la
              construcción. Aplica a ciudadanos extranjeros residentes en
              Indonesia bajo ciertas condiciones legales.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-foreground">
              PT PMA (Penanaman Modal Asing).
            </dt>
            <dd className="text-muted-foreground leading-relaxed mt-1">
              Constitución de una empresa de capital extranjero que puede
              ostentar derechos sobre el suelo. Es una estructura societaria
              con implicaciones fiscales y de gobernanza que requiere asesoría
              especializada.
            </dd>
          </div>
        </dl>
        <p className="text-muted-foreground leading-relaxed">
          La elección entre estas estructuras depende del perfil del comprador,
          el tipo de uso previsto y la zona del inmueble. Las condiciones
          específicas, plazos y requisitos legales pueden variar y deben ser
          revisados por un asesor local antes de cualquier operación.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. Las estructuras de titularidad en Indonesia son complejas
          y la regulación puede variar. No constituye asesoramiento legal. Consulte
          con un abogado especializado en derecho inmobiliario indonesio antes de
          realizar cualquier operación.
        </p>
      </div>
    </>
  )
}

// ─── Tier 1: Emiratos Árabes Unidos ──────────────────────────────────────────

function EmiratosContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Emiratos Árabes Unidos: panorama del mercado inmobiliario de lujo
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Los Emiratos Árabes Unidos —y Dubai en particular— representan uno de
          los mercados de lujo de mayor dinamismo a escala global. La capacidad del
          emirato para atraer capital internacional, su posición como hub de
          conectividad entre Europa, Asia y África, y una política activa de
          apertura al inversor extranjero explican la atracción sostenida que ejerce
          sobre compradores de alto patrimonio de todas las procedencias.
        </p>
        <p>
          Dubai opera con características de mercado propias: ausencia de impuesto
          sobre la renta y las plusvalías en el comprador persona física, una
          infraestructura de clase mundial, un marco regulatorio predecible y una
          oferta residencial que se ha sofisticado notablemente en la última década.
          El segmento de prime y super-prime —penthouses en torres icónicas, villas
          en primera línea de mar, residencias en comunidades cerradas de diseño—
          mantiene una demanda activa alimentada por compradores de Europa, Asia,
          el subcontinente indio y Latinoamérica.{' '}
          <Link
            href="/blog/comprar-propiedad-dubai-siendo-latino-guia-2026"
            className="text-gold hover:underline"
          >
            Puede consultarse una guía para el comprador latinoamericano en nuestro
            blog.
          </Link>
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
        Principales zonas en Dubai
      </h2>
      <div className="space-y-8">

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Palm Jumeirah
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Palm Jumeirah es el referente icónico del lujo inmobiliario de Dubai.
            Las villas en primera línea y los apartamentos en las frondas del
            archipiélago artificial mantienen su posición como producto aspiracional
            para el comprador internacional. La concentración de hoteles de cinco
            estrellas, marinas privadas y restauración de nivel refuerza el perfil
            de la zona.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Downtown Dubai y Burj Khalifa District
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            El centro urbano de Dubai —con el Burj Khalifa, Dubai Mall y el canal
            como ejes— concentra la mayor densidad de torres residenciales de lujo.
            Los penthouses y apartamentos de grandes superficies en este distrito
            son demandados tanto por el comprador que prioriza el uso urbano como
            por el orientado al mercado de alquiler a corto plazo de alto standing.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Dubai Marina y JBR
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Dubai Marina ofrece un entorno urbano-costero con acceso peatonal a la
            playa. Las torres con vistas al canal y al mar configuran un producto
            con alta demanda en el segmento de alquiler vacacional de alta gama y
            residencia temporal. La franja peatonal de JBR (Jumeirah Beach
            Residence) es la zona de paseo de referencia del área.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Dubai Hills y nuevos desarrollos maestros
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Los grandes desarrollos planificados —Dubai Hills Estate, Emirates
            Living, Mohammed Bin Rashid City— ofrecen un modelo de vida diferente
            al urbano: comunidades cerradas con golf, parques y colegios
            internacionales, orientadas al perfil familiar y al comprador que
            prioriza espacio y privacidad.
          </p>
        </div>

      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Marco legal para compradores extranjeros
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Los Emiratos Árabes Unidos han establecido un sistema de zonas designadas
          en las que los ciudadanos extranjeros pueden adquirir inmuebles en{' '}
          <strong className="font-semibold text-foreground">pleno dominio
          (freehold)</strong>. Fuera de estas zonas, los extranjeros pueden acceder
          a la propiedad en régimen de <em>leasehold</em> (arrendamiento a largo
          plazo, generalmente 99 años) o <em>musataha</em>.
        </p>
        <p>
          Las principales zonas freehold en Dubai —incluyendo Palm Jumeirah,
          Downtown Dubai, Dubai Marina, Dubai Hills Estate, Business Bay, Jumeirah
          Village Circle y otras áreas designadas— permiten la adquisición en pleno
          dominio por ciudadanos de cualquier nacionalidad sin restricciones de
          procedencia.
        </p>
        <p>
          La inversión inmobiliaria en los EAU puede dar acceso al{' '}
          <strong className="font-semibold text-foreground">Golden Visa de 10
          años</strong>, un programa de residencia de larga duración vinculado a
          una inversión mínima en propiedad de 2 millones AED (aproximadamente
          545.000 €), libre de cargas o financiada con ciertos requisitos. Los
          criterios concretos del programa son establecidos por las autoridades
          emiratíes y pueden actualizarse; para orientación vigente, consulte con
          un asesor legal registrado en los EAU.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. Las condiciones de los programas de visa y las listas de
          zonas freehold pueden variar. No constituye asesoramiento legal. Consulte
          con un abogado registrado en los EAU para operaciones concretas.
        </p>
      </div>
    </>
  )
}

// ─── Tier 2: Argentina ───────────────────────────────────────────────────────

function ArgentinaContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Argentina: panorama del mercado de lujo
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Argentina ofrece un escenario inmobiliario con características singulares
          dentro del contexto latinoamericano. Buenos Aires —y en particular sus
          barrios de mayor demanda histórica— mantiene un mercado residencial con
          producto de calidad arquitectónica contrastada y precios que representan
          una entrada comparativamente asequible para el comprador con capital
          internacional.
        </p>
        <p>
          El mercado porteño de lujo se concentra en barrios como Palermo Chico,
          Recoleta y Puerto Madero en la ciudad, y en el corredor de countries y
          clubes de campo del Gran Buenos Aires —Nordelta, San Isidro, Pilar— donde
          las casas con parcela, acceso a golf y seguridad privada configuran el
          producto de mayor demanda en el segmento premium familiar.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
        Zonas principales
      </h2>
      <div className="space-y-8">

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Buenos Aires — barrios premium
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            En la ciudad de Buenos Aires, el perfil del comprador de lujo busca
            apartamentos de gran superficie en edificios con amenities completos o
            en propiedades de categoría patrimonial en Recoleta y Palermo. Puerto
            Madero, como desarrollo moderno sobre el Río de la Plata, aporta torres
            de estándar internacional con vistas al agua que concentran la demanda
            del comprador que prioriza la ubicación y la calidad constructiva.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Patagonia y destinos de naturaleza
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Argentina cuenta también con un segmento de lujo vinculado a sus
            destinos de naturaleza excepcional. San Carlos de Bariloche y la región
            de los lagos patagónicos albergan propiedades de alta gama orientadas
            al turismo y la residencia estacional, con una estética y un entorno
            sin equivalente en el continente.
          </p>
        </div>

      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Notas para el comprador internacional
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Los ciudadanos extranjeros pueden adquirir bienes inmuebles residenciales
          en Argentina en condiciones similares a las de los nacionales, sin
          restricciones de nacionalidad en el mercado urbano y residencial libre.
          La adquisición de tierras rurales y zonas de frontera está sujeta a una
          normativa específica (Ley 26.737), por lo que conviene verificar el
          régimen aplicable según el tipo y la ubicación del inmueble. La
          particularidad más
          relevante para el comprador internacional es el entorno cambiario del
          país: las operaciones inmobiliarias se realizan habitualmente en dólares
          estadounidenses, y la repatriación de capital puede estar sujeta a
          restricciones según la normativa vigente en el momento de la operación.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general. Las
          regulaciones cambiarias y fiscales en Argentina están sujetas a cambios
          frecuentes. No constituye asesoramiento legal ni financiero. Para
          operaciones concretas, consulte con un abogado y un asesor fiscal
          argentinos.
        </p>
      </div>
    </>
  )
}

// ─── Tier 2: Estados Unidos ───────────────────────────────────────────────────

function EstadosUnidosContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Estados Unidos: panorama del mercado de lujo
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          El mercado inmobiliario de lujo en Estados Unidos es el de mayor
          profundidad y liquidez a escala mundial. La diversidad de sus destinos
          —desde los centros financieros y culturales de la costa este hasta los
          enclaves de sol y bienestar de Florida y California, pasando por los
          destinos de montaña del oeste— permite una segmentación de producto que
          se adapta a prácticamente cualquier perfil de comprador internacional.
        </p>
        <p>
          Para el comprador latinoamericano o europeo, Estados Unidos combina un
          marco jurídico maduro con plena protección de la propiedad privada,
          liquidez contrastada en los principales mercados y acceso a financiación
          hipotecaria para no residentes —con condiciones más exigentes que para
          ciudadanos, pero disponibles a través de entidades especializadas.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
        Zonas principales
      </h2>
      <div className="space-y-8">

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            Florida — Miami y el sur de la Florida
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Florida concentra la mayor proporción de compradores internacionales
            del mercado inmobiliario norteamericano. Miami —con su dinámica
            latinoamericana, su perfil de hub financiero regional y su oferta de
            penthouses y propiedades frente al mar— representa el punto de entrada
            más habitual para el comprador de alto patrimonio procedente de
            Latinoamérica y Europa.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold mb-3">
            California — Los Ángeles y costa del Pacífico
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            California alberga el mercado de lujo con mayor concentración de
            producto arquitectónico singular: casas de diseño de autor, propiedades
            en acantilado con vistas al Pacífico y comunidades de alto standing en
            Beverly Hills, Bel Air y la costa de Malibu configuran la oferta
            diferencial del mercado californiano.
          </p>
        </div>

      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Notas para el comprador internacional
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Los ciudadanos extranjeros pueden adquirir bienes inmuebles en Estados
          Unidos de forma general sin restricciones de nacionalidad. La adquisición
          puede realizarse a título personal o a través de estructuras societarias
          (LLC, trust u otras). Las implicaciones fiscales —en particular el FIRPTA,
          retención sobre plusvalías para no residentes en la transmisión— son
          relevantes y justifican la consulta previa con un asesor especializado en
          operaciones inmobiliarias internacionales.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general. No
          constituye asesoramiento fiscal ni legal. Para operaciones en Estados
          Unidos, consulte con un abogado y un CPA con experiencia en inversión
          inmobiliaria por no residentes.
        </p>
      </div>
    </>
  )
}

// ─── Tier 3: Costa Rica ───────────────────────────────────────────────────────

function CostaRicaContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Costa Rica: contexto del mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Costa Rica ocupa un lugar propio en el mapa del lujo centroamericano.
          El país combina estabilidad política e institucional —notable en el
          contexto regional—, una naturaleza de excepcional biodiversidad y un
          modelo de turismo que ha atraído a lo largo de décadas un perfil de
          comprador internacional interesado en la segunda residencia y en un
          estándar de vida vinculado al entorno natural.
        </p>
        <p>
          El mercado de lujo costarricense se concentra principalmente en el
          corredor del Pacífico norte —Guanacaste, Tamarindo, Papagayo— donde
          los desarrollos residenciales frente al mar conviven con resorts de
          cinco estrellas, y en el Valle Central, con San José y sus áreas
          residenciales como centro de servicios y demanda urbana.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Acceso al mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          La legislación costarricense permite, con carácter general, que los
          ciudadanos extranjeros adquieran propiedades en las mismas condiciones
          que los nacionales. La excepción relevante es la{' '}
          <strong className="font-semibold text-foreground">Zona
          Marítimo-Terrestre</strong>, que comprende los primeros 200 metros desde
          la pleamar ordinaria: los primeros 50 metros son Zona Pública (dominio
          público, no susceptible de propiedad privada), y los siguientes 150
          metros son Zona Restringida, que se opera mediante concesión otorgada
          por la municipalidad correspondiente. Las propiedades de primera línea
          en la costa pueden estar sujetas a este régimen, por lo que conviene
          verificar la situación jurídica concreta de cada inmueble antes de
          operar.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. No constituye asesoramiento legal. Para operaciones concretas
          en Costa Rica, consulte con un abogado registrado en el país.
        </p>
      </div>
    </>
  )
}

// ─── Tier 3: Reino Unido ─────────────────────────────────────────────────────

function ReinoUnidoContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Reino Unido: contexto del mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          El mercado inmobiliario de lujo del Reino Unido está dominado por
          Londres, que mantiene su condición de uno de los mercados prime más
          profundos del mundo. Prime Central London —los distritos de Mayfair,
          Belgravia, Knightsbridge, Chelsea y Kensington— concentra una demanda
          internacional que, a pesar de los ciclos, sostiene valores unitarios
          entre los más altos del planeta. Fuera de la capital, los Cotswolds,
          Surrey y determinados condados del sur de Inglaterra albergan un mercado
          de casas de campo y mansiones orientado a un comprador con arraigo en
          el país o interesado en el estilo de vida rural de alta gama.
        </p>
        <p>
          La salida del Reino Unido de la Unión Europea ha modificado las
          condiciones de acceso para ciudadanos comunitarios: el derecho a
          residencia automática ya no existe, y quienes deseen establecerse en el
          país necesitan acogerse a los programas migratorios vigentes. La compra
          de inmuebles, no obstante, no está sujeta a restricciones de nacionalidad.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Acceso al mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Los ciudadanos extranjeros pueden adquirir inmuebles en el Reino Unido
          sin restricciones de nacionalidad, tanto a título personal como a través
          de estructuras societarias. El <em>Stamp Duty Land Tax</em> (SDLT) incluye
          un recargo del 2% para compradores no residentes, que se suma a la
          progresividad general del impuesto. Las implicaciones fiscales de la
          tenencia y la transmisión de activos inmobiliarios en el Reino Unido son
          relevantes y requieren asesoría especializada en UK property.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. No constituye asesoramiento fiscal ni legal. Para operaciones
          en el Reino Unido, consulte con un solicitor o asesor fiscal especializado.
        </p>
      </div>
    </>
  )
}

// ─── Tier 3: Ecuador ─────────────────────────────────────────────────────────

function EcuadorContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Ecuador: contexto del mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Ecuador concentra su mercado de propiedades de calidad en dos ciudades
          con perfiles diferenciados. Quito, la capital, combina un centro histórico
          declarado Patrimonio de la Humanidad por la UNESCO con barrios residenciales
          de alto standing —Cumbayá, Los Chillos, González Suárez— que concentran
          la oferta premium urbana. Cuenca, en los Andes, ha atraído a lo largo de
          los últimos años a un perfil de comprador internacional —principalmente
          norteamericano— en busca de calidad de vida, clima templado y coste
          contenido. La costa ecuatoriana, con Salinas y Montañita como referentes,
          alberga un mercado de segunda residencia orientado al comprador nacional
          y regional.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Acceso al mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          La legislación ecuatoriana reconoce a los ciudadanos extranjeros los
          mismos derechos que a los nacionales para la adquisición de bienes
          inmuebles, sin restricciones de nacionalidad ni zonas reservadas en el
          mercado residencial general. La estructura de la operación —compraventa
          directa ante notario— es relativamente sencilla en comparación con otros
          mercados de la región.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. No constituye asesoramiento legal. Para operaciones concretas
          en Ecuador, consulte con un abogado local.
        </p>
      </div>
    </>
  )
}

// ─── Tier 3: Grecia ───────────────────────────────────────────────────────────

function GreciaContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Grecia: contexto del mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Grecia combina un patrimonio cultural sin equivalente en Europa con un
          mercado inmobiliario de lujo concentrado en sus islas más reconocidas
          internacionalmente: Mykonos, Santorini, Creta y las islas del
          Dodecaneso. El segmento de villas privadas con piscina y vistas al Egeo
          representa el producto icónico del lujo griego. Atenas, por su parte
          —especialmente en el barrio de Kolonaki, la riviera sur y el área de
          Glyfada— ha experimentado una recuperación notable del mercado residencial
          de alta gama en la última década.
        </p>
        <p>
          Grecia mantiene activo un programa de{' '}
          <strong className="font-semibold text-foreground">Golden Visa</strong>{' '}
          por inversión inmobiliaria para compradores no comunitarios, reformado
          en 2024 con umbrales diferenciados por zona: 800.000 € en áreas de mayor
          demanda (Ática, Salónica, Mykonos, Santorini y otras islas designadas)
          y 400.000 € en el resto del territorio. El programa ha atraído a
          compradores procedentes de Asia, Oriente Medio y Latinoamérica
          interesados en combinar la inversión con el acceso al espacio Schengen.
          Los umbrales y condiciones específicas pueden actualizarse; conviene
          verificar el régimen vigente con un asesor local antes de estructurar
          una operación.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Acceso al mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Los ciudadanos de la UE pueden adquirir propiedades en Grecia sin
          restricciones generales. Los ciudadanos no comunitarios pueden adquirir
          inmuebles en la mayor parte del territorio, aunque existen zonas
          fronterizas y áreas designadas donde se aplican procedimientos específicos
          de autorización. Las condiciones y umbrales del programa de visa de
          inversión son establecidos por las autoridades griegas y pueden variar;
          para orientación actualizada, consulte con un asesor local especializado.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. No constituye asesoramiento legal. Para operaciones concretas
          en Grecia, consulte con un abogado registrado en el país.
        </p>
      </div>
    </>
  )
}

// ─── Tier 3: Paraguay ────────────────────────────────────────────────────────

function ParaguayContent() {
  return (
    <>
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Paraguay: contexto del mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Paraguay representa un mercado en desarrollo dentro del contexto
          sudamericano, con una economía que ha mantenido un crecimiento estable
          en las últimas décadas y un interés creciente entre inversores
          latinoamericanos y europeos atraídos por su régimen fiscal competitivo
          y sus bajos costes operativos. Asunción concentra la actividad
          inmobiliaria del país, con un mercado residencial de alta gama incipiente
          en barrios como Las Mercedes, Carmelitas y el corredor del río Paraguay.
          El sector de suelo agrícola y estancias es otro de los atractivos
          tradicionales del mercado inmobiliario paraguayo para el inversor externo.
        </p>
      </div>

      <div className="h-px w-12 bg-gold my-10" />

      <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Acceso al mercado
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          La legislación paraguaya permite, con carácter general, que los
          ciudadanos extranjeros adquieran bienes inmuebles en las mismas
          condiciones que los nacionales. Paraguay es reconocido por la relativa
          sencillez de sus procesos de residencia para extranjeros y su política
          de apertura a la inversión internacional.
        </p>
        <p className="text-xs text-muted-foreground/70 italic border-l-2 border-gold/30 pl-3">
          La información contenida en este apartado es de carácter general e
          informativo. No constituye asesoramiento legal. Para operaciones concretas
          en Paraguay, consulte con un abogado local.
        </p>
      </div>
    </>
  )
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

const EDITORIAL_MAP: Record<string, () => ReactNode> = {
  'mexico':                 MexicoContent,
  'indonesia':              IndonesiaContent,
  'emiratos-arabes-unidos': EmiratosContent,
  'argentina':              ArgentinaContent,
  'estados-unidos':         EstadosUnidosContent,
  'costa-rica':             CostaRicaContent,
  'reino-unido':            ReinoUnidoContent,
  'ecuador':                EcuadorContent,
  'grecia':                 GreciaContent,
  'paraguay':               ParaguayContent,
}

export function getDestinoEditorial(slug: string): ReactNode | null {
  const Component = EDITORIAL_MAP[slug]
  if (!Component) return null
  return <Component />
}
