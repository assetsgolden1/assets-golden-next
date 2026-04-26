/**
 * seed-blog-posts.ts
 * Inserta 20 posts de blog (10 ES + 10 EN) en Supabase.
 * Uso: npx tsx scripts/seed-blog-posts.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
}
loadEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const IMG = {
  coast:    'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
  legal:    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
  spain:    'https://images.unsplash.com/photo-1568702846955-b8d4d82a7efd',
  beach:    'https://images.unsplash.com/photo-1520637836862-4d197e932b70',
  villa:    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  dubai:    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  tulum:    'https://images.unsplash.com/photo-1552581234-26160f608093',
  estepona: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054',
  arch:     'https://images.unsplash.com/photo-1534430480872-9a99c5cf5e29',
  invest:   'https://images.unsplash.com/photo-1535905557558-19f7fb07b673',
}
const c = (id: string) => `${id}?w=800&h=500&fit=crop&q=80`
const b = (id: string) => `${id}?w=1920&h=800&fit=crop&q=80`

const posts = [

  // ─── ESPAÑOL 1 ─────────────────────────────────────────────────
  {
    title: 'Comprar piso en España siendo extranjero: guía completa 2026',
    slug: 'comprar-piso-espana-siendo-extranjero-2026',
    category: 'guias',
    language: 'es',
    read_time: 9,
    excerpt: 'Todo lo que necesita saber para comprar una propiedad en España siendo extranjero: documentación, proceso legal, impuestos y las zonas más demandadas en 2026.',
    meta_description: 'Guía completa 2026 para comprar piso en España siendo extranjero. NIE, impuestos, proceso paso a paso y zonas de mayor demanda. Asesoramiento personalizado.',
    cover_image: c(IMG.coast), banner_image_url: b(IMG.coast),
    content: `<p><strong>En resumen:</strong> Los extranjeros pueden comprar libremente en España sin restricciones de nacionalidad. El proceso requiere el NIE, una cuenta bancaria española y due diligence legal. Los gastos adicionales representan entre el 10 % y el 14 % del precio. Los compradores internacionales representaron el <strong>15,8 %</strong> de todas las compraventas en España en 2024.</p>

<h2>¿Pueden los extranjeros comprar piso en España?</h2>
<p>España permite a cualquier ciudadano extranjero, independientemente de su nacionalidad o residencia, adquirir bienes inmuebles en el país. No existe ninguna restricción legal que impida a un no residente comprar una vivienda, un local comercial o una parcela. Esta apertura convierte a España en uno de los mercados inmobiliarios más accesibles y seguros de Europa para el inversor internacional.</p>
<p>Las provincias de Alicante, Málaga y las Islas Baleares concentran la mayor parte de las operaciones realizadas por extranjeros. En la Costa del Sol, los compradores internacionales suponen más del <strong>35 %</strong> de las transacciones registradas cada año.</p>

<h2>Documentación imprescindible</h2>
<p>Para completar una compraventa en España siendo extranjero necesitará:</p>
<ul>
<li><strong>NIE (Número de Identidad de Extranjero):</strong> identificación fiscal obligatoria para cualquier operación económica en España.</li>
<li><strong>Pasaporte en vigor:</strong> válido durante todo el proceso de compra.</li>
<li><strong>Cuenta bancaria española:</strong> para el pago del precio y la domiciliación de impuestos y comunidad.</li>
<li><strong>Poder notarial:</strong> si no puede estar presente en la firma, puede otorgar poderes a un abogado para que actúe en su nombre.</li>
</ul>

<h2>El proceso de compra paso a paso</h2>
<p>El proceso habitual de compra para un extranjero consta de las siguientes fases:</p>
<ul>
<li><strong>Obtener el NIE:</strong> en el consulado español de su país o en una comisaría de policía en España. Plazo: 2 a 4 semanas.</li>
<li><strong>Due diligence jurídica:</strong> el abogado verifica cargas, deudas, situación urbanística y estado registral del inmueble.</li>
<li><strong>Contrato de arras:</strong> reserva del inmueble con entrega de un depósito del 10 % del precio acordado.</li>
<li><strong>Obtención de hipoteca (si aplica):</strong> los bancos españoles financian hasta el 70 % para no residentes.</li>
<li><strong>Escritura pública ante notario:</strong> firma y entrega del precio restante.</li>
<li><strong>Inscripción en el Registro de la Propiedad:</strong> otorga plena protección jurídica al comprador.</li>
</ul>
<p>El plazo total entre contrato de arras y escritura es habitualmente de <strong>30 a 90 días</strong>.</p>

<h2>Costes e impuestos en 2026</h2>
<p>Además del precio de compra, deberá prever los siguientes costes:</p>
<ul>
<li><strong>Obra nueva:</strong> IVA del 10 % + Actos Jurídicos Documentados (0,5–1,5 % según comunidad autónoma).</li>
<li><strong>Segunda mano:</strong> Impuesto de Transmisiones Patrimoniales (ITP) del 6–10 % según comunidad autónoma. En Andalucía, el tipo reducido es del 7 %.</li>
<li><strong>Notaría y registro:</strong> entre 1.000 y 2.500 euros según el valor del inmueble.</li>
<li><strong>Honorarios de abogado:</strong> entre el 1 % y el 1,5 % del precio de compra.</li>
</ul>
<p>El coste total adicional oscila entre el <strong>10 % y el 14 %</strong> del precio de compraventa.</p>

<h2>Hipoteca para extranjeros no residentes</h2>
<p>Los no residentes acceden a hipotecas en España con condiciones específicas. La financiación máxima habitual es del <strong>60–70 % del valor de tasación</strong>, con plazos de hasta 20–25 años. Los tipos de interés hipotecario en España se sitúan actualmente entre el 3,2 % y el 4,1 % para hipotecas variables y entre el 3,5 % y el 4,5 % para hipotecas fijas, según la entidad y el perfil del comprador.</p>

<h2>Zonas con mayor demanda extranjera en 2026</h2>
<p>Las zonas más buscadas por compradores internacionales son la Costa del Sol (Marbella, Estepona, Benahavís), la Costa Blanca (Alicante, Jávea, Altea), Mallorca y Menorca, Barcelona y Madrid capital. Los precios medios en Marbella superan los <strong>5.000 euros por metro cuadrado</strong> en las zonas prime, mientras que la Costa Blanca norte ofrece opciones a partir de 2.500 euros por metro cuadrado.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿Necesito residir en España para comprar un piso?</h3>
<p>No. Cualquier extranjero puede adquirir una propiedad en España sin ser residente ni tener intención de residir en el país. Solo necesita el NIE y una cuenta bancaria española.</p>

<h3>¿Cuánto tarda en tramitarse el NIE?</h3>
<p>En consulados españoles en el extranjero, el plazo es de 2 a 4 semanas. En España, en una oficina de extranjería o comisaría, puede obtenerse en el mismo día o en 2 a 5 días hábiles según la zona.</p>

<h3>¿Qué impuestos paga un propietario extranjero no residente?</h3>
<p>Los no residentes tributan por el Impuesto sobre la Renta de No Residentes (IRNR). Si el inmueble está vacío, se aplica una imputación de renta del 1,1 % del valor catastral. Los ingresos por alquiler tributan al 19 % para residentes de la UE y al 24 % para el resto de países.</p>

<h3>¿Es seguro comprar en España como extranjero?</h3>
<p>Sí. El sistema registral español ofrece plena seguridad jurídica al comprador de buena fe. Inscribir la compra en el Registro de la Propiedad protege frente a cargas ocultas y reclamaciones de terceros. Contar con un abogado independiente es la garantía adicional recomendable.</p>

<h3>¿Puedo alquilar la propiedad cuando no la use?</h3>
<p>Sí, aunque el alquiler turístico requiere una licencia de vivienda vacacional cuya regulación varía según la comunidad autónoma y el municipio. En Andalucía, el registro es relativamente ágil; en Baleares y Canarias las restricciones son más estrictas.</p>

<p style="margin-top:2rem"><strong>¿Está considerando comprar una propiedad en España?</strong> Nuestro equipo de asesores especializados en compradores internacionales puede acompañarle en cada etapa del proceso. <a href="/contacto" style="color:#b8942e;font-weight:600">Contacte con nosotros</a> para una consulta inicial sin compromiso.</p>`,
  },

  // ─── ESPAÑOL 2 ─────────────────────────────────────────────────
  {
    title: 'NIE para comprar propiedad en España: cómo obtenerlo paso a paso',
    slug: 'nie-para-comprar-propiedad-espana-paso-a-paso',
    category: 'guias',
    language: 'es',
    read_time: 7,
    excerpt: 'El NIE es el primer requisito para comprar una propiedad en España como extranjero. Le explicamos cómo solicitarlo, cuánto tarda y qué documentación necesita.',
    meta_description: 'Cómo obtener el NIE para comprar piso en España: documentos necesarios, dónde solicitarlo, plazos y coste. Guía actualizada 2026.',
    cover_image: c(IMG.legal), banner_image_url: b(IMG.legal),
    content: `<p><strong>En resumen:</strong> El NIE (Número de Identidad de Extranjero) es el identificador fiscal obligatorio para cualquier operación económica en España, incluyendo la compra de una propiedad. Puede solicitarse en el consulado español de su país o directamente en España. El trámite es relativamente sencillo y puede completarse en días si se dispone de la documentación correcta.</p>

<h2>¿Qué es el NIE y para qué sirve?</h2>
<p>El NIE es un número de identificación personal, de carácter fiscal, que España asigna a todos los extranjeros que realizan actividades económicas en el país. No implica residencia ni permiso de trabajo. Su único propósito es identificar fiscalmente al titular en operaciones como la compraventa de inmuebles, la apertura de cuentas bancarias, la firma de contratos o la presentación de declaraciones tributarias.</p>
<p>Sin NIE no es posible otorgar escritura de compraventa ante notario ni inscribir la propiedad en el Registro. Por eso es el <strong>primer trámite que debe gestionar</strong> cualquier comprador extranjero.</p>

<h2>Dónde solicitar el NIE</h2>
<p>Existen dos vías para obtener el NIE:</p>
<ul>
<li><strong>En el consulado español de su país:</strong> recomendado si aún no ha viajado a España. El plazo habitual es de 2 a 6 semanas según la demanda del consulado.</li>
<li><strong>En España, en persona:</strong> en la Oficina de Extranjería de la provincia correspondiente o en determinadas comisarías de policía habilitadas. Es necesario solicitar cita previa a través del portal oficial del Ministerio del Interior.</li>
</ul>
<p>También es posible otorgar un <strong>poder notarial</strong> a un abogado español para que gestione el NIE en su nombre, evitando así el desplazamiento.</p>

<h2>Documentación necesaria</h2>
<p>Para solicitar el NIE necesitará presentar los siguientes documentos:</p>
<ul>
<li>Formulario EX-15 (solicitud de asignación de NIE), disponible en la web del Ministerio del Interior.</li>
<li>Pasaporte original en vigor y fotocopia.</li>
<li>Justificante de la razón económica, social o profesional que motiva la solicitud (por ejemplo, contrato de arras, certificado de intención de compra firmado por la inmobiliaria, o carta de un abogado).</li>
<li>Tasa 790 código 012 abonada (importe actual: 9,84 euros).</li>
</ul>

<h2>Plazos y coste</h2>
<p>El coste oficial del NIE es de <strong>9,84 euros</strong>. Si lo tramita a través de un abogado o gestor, los honorarios por la gestión pueden oscilar entre 100 y 300 euros.</p>
<p>Los plazos habituales son:</p>
<ul>
<li>En consulado: 2 a 6 semanas.</li>
<li>En persona en España: el mismo día o hasta 5 días hábiles.</li>
<li>A través de poder notarial: entre 5 y 15 días hábiles.</li>
</ul>

<h2>NIE vs Residencia: diferencias clave</h2>
<p>Es importante distinguir entre el NIE y el número de identidad de extranjero residente (TIE). El NIE es un número fiscal que puede obtener cualquier extranjero sin vivir en España. El TIE (Tarjeta de Identidad de Extranjero) es el documento que acredita la residencia legal en España para estancias superiores a 90 días.</p>
<p>Para la compra de una propiedad como no residente, <strong>solo se necesita el NIE</strong>. No es obligatorio obtener la residencia ni el TIE.</p>

<h2>El NIE y la Golden Visa</h2>
<p>Si su inversión inmobiliaria supera los <strong>500.000 euros</strong>, puede optar a la Golden Visa española, que otorga residencia temporal a usted y su familia inmediata. En este caso, la obtención del NIE es también el primer paso, aunque el proceso completo implica trámites adicionales ante el Consulado o la Oficina de Extranjería.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿El NIE caduca?</h3>
<p>El número de NIE no caduca. Es un identificador permanente. Sin embargo, el documento físico (certificado de NIE) tiene una validez de 3 meses. Para la mayoría de operaciones posteriores, lo relevante es el número, no la vigencia del certificado.</p>

<h3>¿Puedo comprar sin NIE con un poder notarial?</h3>
<p>No directamente. El NIE es necesario en la escritura de compraventa. Lo que sí puede hacerse es otorgar un poder a un representante que gestione el NIE y posteriormente firme la escritura en su nombre.</p>

<h3>¿Es lo mismo NIE que NIF?</h3>
<p>Para los extranjeros no residentes, el NIE actúa como NIF (Número de Identificación Fiscal) a efectos tributarios. Son el mismo número a efectos prácticos en el contexto de la compraventa inmobiliaria.</p>

<h3>¿Cuánto tarda si lo gestiono desde mi país?</h3>
<p>La tramitación en el consulado español de su país de residencia puede tardar entre 2 y 6 semanas, dependiendo de la carga de trabajo del consulado. Se recomienda iniciar la gestión con antelación, antes de firmar el contrato de arras, para evitar retrasos en la escrituración.</p>

<p style="margin-top:2rem"><strong>¿Necesita ayuda para gestionar el NIE y la compra?</strong> Nuestros asesores le acompañan en todo el proceso legal, desde el NIE hasta la inscripción registral. <a href="/contacto" style="color:#b8942e;font-weight:600">Solicite información sin compromiso.</a></p>`,
  },

  // ─── ESPAÑOL 3 ─────────────────────────────────────────────────
  {
    title: 'Costa del Sol vs Costa Blanca: dónde invertir en 2026',
    slug: 'costa-del-sol-vs-costa-blanca-invertir-2026',
    category: 'zonas',
    language: 'es',
    read_time: 8,
    excerpt: 'Comparativa detallada entre Costa del Sol y Costa Blanca para inversores internacionales: precios, rentabilidades, demanda y perfil de comprador en 2026.',
    meta_description: 'Costa del Sol vs Costa Blanca: comparativa de precios, rentabilidad, demanda y calidad de vida para inversores inmobiliarios en 2026. ¿Cuál es mejor para usted?',
    cover_image: c(IMG.spain), banner_image_url: b(IMG.spain),
    content: `<p><strong>En resumen:</strong> Costa del Sol y Costa Blanca son los dos mercados costeros más activos de España para compradores internacionales. La Costa del Sol ofrece valores de activo superiores, mayor demanda de alquiler vacacional y un mercado de lujo más consolidado. La Costa Blanca presenta precios más accesibles y una demanda extranjera más diversificada, especialmente entre compradores centroeuropeos.</p>

<h2>Panorama general del mercado en 2026</h2>
<p>Ambas costas han experimentado un crecimiento sostenido del precio en los últimos tres años. La Costa del Sol registró en 2024 un incremento medio del precio del <strong>8,4 %</strong> interanual en el segmento residencial. La Costa Blanca creció a un ritmo del <strong>6,1 %</strong> en el mismo periodo, con zonas como Jávea y Moraira superando el 9 %.</p>
<p>La mayor diferencia entre ambas radica en el ticket medio de inversión y el perfil del comprador. La Costa del Sol atrae a un comprador de alto poder adquisitivo, con una inversión media por operación superior a los <strong>550.000 euros</strong>. En la Costa Blanca, la media se sitúa en torno a los <strong>280.000 euros</strong>, con un abanico más amplio que va desde residencias de primera línea de playa hasta villas de lujo en el interior.</p>

<h2>Comparativa de precios por zona</h2>
<p>Los precios medios por metro cuadrado en las zonas principales de cada costa son los siguientes:</p>
<ul>
<li><strong>Marbella (Costa del Sol):</strong> 5.200–9.000 €/m² en zonas prime como Nagüeles o Sierra Blanca.</li>
<li><strong>Estepona (Costa del Sol):</strong> 3.200–5.500 €/m² dependiendo del tipo de promoción.</li>
<li><strong>Alicante capital (Costa Blanca):</strong> 2.000–3.500 €/m².</li>
<li><strong>Jávea / Altea (Costa Blanca norte):</strong> 3.500–5.500 €/m² para villas con vistas al mar.</li>
<li><strong>Torrevieja / Orihuela Costa (Costa Blanca sur):</strong> 1.500–2.500 €/m².</li>
</ul>

<h2>Rentabilidad del alquiler vacacional</h2>
<p>La rentabilidad bruta del alquiler vacacional en ambas costas es atractiva, aunque con diferencias notables:</p>
<ul>
<li><strong>Costa del Sol:</strong> yields del 4,5 % al 7 % bruto anual en propiedades bien ubicadas. Las temporadas alta y media son más largas gracias al clima.</li>
<li><strong>Costa Blanca:</strong> yields del 4 % al 6,5 % bruto. La temporada alta es más concentrada en los meses de julio y agosto.</li>
</ul>
<p>Un apartamento de 2 dormitorios en primera línea de playa en Marbella puede generar <strong>entre 25.000 y 45.000 euros anuales</strong> de ingresos por alquiler vacacional. El equivalente en Alicante o Torrevieja genera entre 12.000 y 20.000 euros.</p>

<h2>Perfil de comprador extranjero</h2>
<p>Las nacionalidades predominantes difieren significativamente entre ambas costas:</p>
<ul>
<li><strong>Costa del Sol:</strong> británicos (primera posición histórica, en descenso post-Brexit), suecos, alemanes, latinoamericanos (México, Colombia, Venezuela) y estadounidenses de origen hispano.</li>
<li><strong>Costa Blanca:</strong> británicos (muy significativos en Torrevieja), alemanes, belgas, holandeses y escandinavos.</li>
</ul>

<h2>Infraestructuras y calidad de vida</h2>
<p>Ambas costas disponen de aeropuertos internacionales con vuelos directos desde los principales destinos europeos y americanos. El aeropuerto de Málaga-Costa del Sol gestiona más de <strong>23 millones de pasajeros anuales</strong>. El aeropuerto de Alicante-Elche supera los <strong>16 millones</strong>.</p>
<p>La Costa del Sol dispone de una mayor concentración de instalaciones de lujo: campos de golf (más de 70 en la provincia de Málaga), puertos deportivos de primer nivel, colegios internacionales y centros médicos privados de referencia.</p>

<h2>¿Cuál elegir en función de su objetivo?</h2>
<ul>
<li><strong>Si busca revalorización de capital a largo plazo:</strong> Costa del Sol, especialmente Marbella y Benahavís.</li>
<li><strong>Si busca rentabilidad por alquiler con ticket de entrada menor:</strong> Costa Blanca norte (Jávea, Altea) o Costa del Sol (Estepona).</li>
<li><strong>Si busca segunda residencia con alta calidad de vida:</strong> ambas son excelentes; la elección depende de preferencias personales de entorno y lifestyle.</li>
</ul>

<h2>Preguntas frecuentes</h2>

<h3>¿Qué zona tiene mejores perspectivas de revalorización en 2026?</h3>
<p>Marbella y la Nueva Milla de Oro (entre Marbella y Estepona) mantienen las mejores perspectivas de revalorización a medio plazo, impulsadas por la escasez de suelo urbanizable y la demanda sostenida de compradores internacionales de alto poder adquisitivo.</p>

<h3>¿En qué zona es más fácil obtener licencia de alquiler vacacional?</h3>
<p>En la Comunidad Valenciana (Costa Blanca), el proceso de registro de viviendas turísticas es relativamente ágil. En Andalucía (Costa del Sol), también existe un registro autonómico, aunque algunos municipios como Marbella aplican normativas locales adicionales.</p>

<h3>¿Cuál tiene mejor conexión internacional?</h3>
<p>El aeropuerto de Málaga tiene un mayor número de conexiones directas internacionales y una mayor frecuencia de vuelos, lo que facilita la gestión de una propiedad de alquiler vacacional desde el extranjero.</p>

<h3>¿Hay diferencias fiscales entre comprar en Andalucía y en la Comunidad Valenciana?</h3>
<p>Sí. El ITP en Andalucía para segunda mano es del 7 % (tipo reducido). En la Comunidad Valenciana es del 10 %. Para obra nueva, el IVA es el mismo (10 %) en ambas comunidades, aunque el AJD varía ligeramente.</p>

<p style="margin-top:2rem"><strong>¿Le ayudamos a encontrar la mejor oportunidad en Costa del Sol?</strong> Disponemos de una selección exclusiva de propiedades en Marbella, Estepona y Benahavís. <a href="/propiedades" style="color:#b8942e;font-weight:600">Ver propiedades disponibles.</a></p>`,
  },

  // ─── ESPAÑOL 4 ─────────────────────────────────────────────────
  {
    title: 'Golden Visa España 2026: cómo conseguir residencia comprando una propiedad',
    slug: 'golden-visa-espana-2026-residencia-comprando-propiedad',
    category: 'inversion',
    language: 'es',
    read_time: 8,
    excerpt: 'La Golden Visa española permite obtener residencia en España con una inversión inmobiliaria mínima de 500.000 euros. Guía completa sobre requisitos, proceso y ventajas en 2026.',
    meta_description: 'Golden Visa España 2026: requisitos, inversión mínima, proceso de solicitud y beneficios. Cómo obtener residencia española comprando una propiedad de lujo.',
    cover_image: c(IMG.beach), banner_image_url: b(IMG.beach),
    content: `<p><strong>En resumen:</strong> La Golden Visa española otorga residencia temporal a inversores extranjeros que adquieran una propiedad por un valor mínimo de <strong>500.000 euros libre de cargas</strong>. La residencia es renovable y permite la libre circulación por el espacio Schengen. El programa ha experimentado un notable incremento de solicitudes procedentes de Latinoamérica, Estados Unidos y Oriente Medio.</p>

<h2>¿Qué es la Golden Visa española?</h2>
<p>La Golden Visa o Visa de Inversor fue introducida en España en 2013 mediante la Ley 14/2013, con el objetivo de atraer capital extranjero. Desde entonces, más de <strong>14.000 inversores</strong> y sus familias han obtenido la residencia española a través de esta vía. Es uno de los programas de residencia por inversión más reconocidos de Europa, especialmente valorado por su flexibilidad y las ventajas de pertenecer al espacio Schengen.</p>

<h2>Requisitos de inversión inmobiliaria</h2>
<p>Para obtener la Golden Visa a través de la compra de inmuebles, los requisitos son los siguientes:</p>
<ul>
<li><strong>Inversión mínima:</strong> 500.000 euros en propiedades inmobiliarias en España, libre de hipotecas o cargas.</li>
<li>Puede distribuirse en varias propiedades, siempre que la suma libre de cargas alcance el umbral mínimo.</li>
<li>La propiedad puede ser de cualquier tipo: residencial, comercial, suelo, etc.</li>
<li>No es necesario residir en España para mantener la Golden Visa, aunque se recomienda al menos una visita anual.</li>
</ul>

<h2>Beneficios de la Golden Visa</h2>
<ul>
<li><strong>Residencia para toda la familia:</strong> incluye al cónyuge, hijos menores de 18 años e hijos mayores que dependan económicamente del titular, así como ascendientes a cargo.</li>
<li><strong>Libre circulación por Schengen:</strong> acceso sin restricciones a los 26 países del espacio Schengen.</li>
<li><strong>No requiere residencia efectiva:</strong> no es obligatorio vivir en España para mantener la Golden Visa ni para renovarla.</li>
<li><strong>Vía a la residencia permanente:</strong> tras 5 años de residencia continuada, es posible solicitar la residencia permanente, y tras 10 años, la ciudadanía española.</li>
</ul>

<h2>Proceso de solicitud paso a paso</h2>
<ul>
<li><strong>1. Adquirir la propiedad:</strong> completar la compraventa y obtener la escritura pública.</li>
<li><strong>2. Solicitar el visado de inversor:</strong> en el consulado español del país de residencia, presentando la escritura, el título de propiedad registrado y el Certificado de Registro de la Propiedad.</li>
<li><strong>3. Ingreso en España y solicitud de la Tarjeta de Residencia:</strong> una vez en España, solicitar la Tarjeta de Identidad de Extranjero Inversor en la Oficina de Extranjería.</li>
<li><strong>4. Renovación:</strong> la primera autorización es por 2 años (visa) o 2 años (residencia). Posteriormente se renueva por periodos de 5 años.</li>
</ul>
<p>El plazo de resolución habitual es de <strong>20 días hábiles</strong> para el visado inicial, y de <strong>20 días hábiles</strong> para la tarjeta de residencia, aunque en la práctica puede extenderse hasta 45 días en periodos de alta demanda.</p>

<h2>Zonas preferidas por los solicitantes de Golden Visa</h2>
<p>Las provincias donde se concentra la mayoría de inversiones vinculadas a la Golden Visa son:</p>
<ul>
<li><strong>Málaga (Costa del Sol):</strong> Marbella y Benahavís son los municipios más elegidos. La abundancia de propiedades de lujo que superan el umbral de los 500.000 euros facilita la elegibilidad.</li>
<li><strong>Madrid:</strong> especialmente los barrios de Salamanca, Chamberí y la zona noroeste (Pozuelo, La Moraleja).</li>
<li><strong>Barcelona:</strong> zonas como Pedralbes, Sarrià y el Paseo de Gracia.</li>
<li><strong>Baleares:</strong> Mallorca, especialmente la Sierra de Tramuntana y Palma centro.</li>
</ul>

<h2>Consideraciones fiscales importantes</h2>
<p>Obtener la Golden Visa no implica automáticamente convertirse en residente fiscal en España. Para ser considerado residente fiscal, es necesario permanecer en España más de <strong>183 días</strong> al año. Los no residentes fiscales tributan únicamente por las rentas generadas en territorio español.</p>
<p>Muchos titulares de Golden Visa optan por mantener su residencia fiscal en su país de origen, especialmente cuando esta ofrece condiciones más favorables o cuando España cuenta con un convenio de doble imposición con dicho país.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿La Golden Visa española sigue vigente en 2026?</h3>
<p>Sí. A fecha de publicación de esta guía, el programa Golden Visa para inversores inmobiliarios sigue en vigor en España. Han existido debates políticos sobre su posible modificación, pero no se han producido cambios legislativos que alteren los requisitos de inversión de 500.000 euros.</p>

<h3>¿Puedo comprar varias propiedades para sumar el mínimo de 500.000 euros?</h3>
<p>Sí. La ley permite distribuir la inversión entre varios inmuebles, siempre que la suma total libre de hipotecas alcance los 500.000 euros. Cada propiedad debe estar registrada a nombre del inversor solicitante.</p>

<h3>¿Cuánto tiempo tengo que vivir en España con la Golden Visa?</h3>
<p>No existe un mínimo de días obligatorios para mantener la Golden Visa o renovarla. Sin embargo, para optar a la residencia permanente o a la ciudadanía, se requiere residencia efectiva continuada de 5 y 10 años respectivamente.</p>

<h3>¿La Golden Visa permite trabajar en España?</h3>
<p>Sí. Los titulares de Golden Visa tienen autorización para trabajar por cuenta propia o ajena en España desde el momento de la concesión de la residencia.</p>

<p style="margin-top:2rem"><strong>¿Desea solicitar información sobre la Golden Visa?</strong> Nuestros asesores especializados en inversión inmobiliaria le guiarán desde la selección de la propiedad hasta la obtención de la residencia. <a href="/contacto" style="color:#b8942e;font-weight:600">Solicitar valoración personalizada.</a></p>`,
  },

  // ─── ESPAÑOL 5 ─────────────────────────────────────────────────
  {
    title: 'Comprar villa en Marbella: zonas exclusivas y precios reales',
    slug: 'comprar-villa-marbella-zonas-exclusivas-precios',
    category: 'zonas',
    language: 'es',
    read_time: 8,
    excerpt: 'Marbella concentra el mayor mercado de villas de lujo de España. Analizamos las zonas más exclusivas, los precios reales en 2026 y los aspectos clave para comprar con garantías.',
    meta_description: 'Comprar villa en Marbella en 2026: zonas exclusivas, precios por metro cuadrado, La Zagaleta, Sierra Blanca, Nueva Andalucía. Guía para compradores internacionales.',
    cover_image: c(IMG.villa), banner_image_url: b(IMG.villa),
    content: `<p><strong>En resumen:</strong> Marbella es el mercado inmobiliario de lujo más activo de España y uno de los más dinámicos de Europa. Los precios de villas en las zonas prime oscilan entre <strong>2 millones y 20 millones de euros</strong>, con transacciones que superan los 30 millones en urbanizaciones exclusivas como La Zagaleta. La demanda internacional sostiene precios al alza con escasez estructural de suelo en las mejores ubicaciones.</p>

<h2>Por qué Marbella sigue liderando el mercado de lujo</h2>
<p>Marbella ha consolidado su posición como la capital del lujo inmobiliario en España durante décadas. Su combinación de más de <strong>320 días de sol al año</strong>, infraestructuras de primer nivel, gastronomía internacional, 70 campos de golf en la provincia y acceso directo al aeropuerto de Málaga (a 45 minutos) crea un entorno difícilmente igualable en Europa.</p>
<p>El precio medio de las villas en Marbella aumentó un <strong>9,2 %</strong> en 2024 respecto al año anterior, según los datos del Registro de la Propiedad de Málaga. La demanda de compradores procedentes de Oriente Medio, Latinoamérica y Europa del Norte sigue siendo muy sólida.</p>

<h2>Las zonas más exclusivas de Marbella</h2>
<p>Marbella no es homogénea. El precio y el perfil del comprador varían significativamente según la zona:</p>
<ul>
<li><strong>La Zagaleta:</strong> la urbanización privada más exclusiva de España. Más de 900 hectáreas cerradas, dos campos de golf, club ecuestre y helipad. Precios de villas entre <strong>5 y 40 millones de euros</strong>. Residentes de ultra-alto patrimonio procedentes de Oriente Medio, Rusia y el Golfo.</li>
<li><strong>Sierra Blanca / Nagüeles:</strong> ladera de la montaña con vistas al mar Mediterráneo y Gibraltar. Villas de 3 a 15 millones de euros, con alta demanda escandinava y del Benelux.</li>
<li><strong>Marbella Club / Puente Romano:</strong> primera línea de playa y Golden Mile. Propiedades entre 2 y 12 millones. Alta densidad de propietarios árabes y latinoamericanos.</li>
<li><strong>Nueva Andalucía / Valle del Golf:</strong> rodeado de campos de golf, con propiedades entre 800.000 y 4 millones. Perfil mixto de primera y segunda residencia.</li>
<li><strong>Puerto Banús:</strong> zona de alto tráfico turístico y actividad comercial. Menos tranquila para primera residencia, pero con buena demanda de alquiler.</li>
</ul>

<h2>Precios reales por metro cuadrado en 2026</h2>
<ul>
<li>La Zagaleta: <strong>8.000–15.000 €/m²</strong> construido.</li>
<li>Sierra Blanca / Golden Mile: <strong>6.000–11.000 €/m²</strong>.</li>
<li>Nueva Andalucía: <strong>4.000–7.500 €/m²</strong>.</li>
<li>Benahavís (municipio limítrofe): <strong>3.500–7.000 €/m²</strong> con grandes parcelas.</li>
<li>Estepona (próxima a Marbella): <strong>3.200–5.500 €/m²</strong>.</li>
</ul>

<h2>Qué incluye una villa de lujo en Marbella</h2>
<p>Las villas de lujo en Marbella típicamente ofrecen: parcelas de 1.000 a 5.000 m², piscina climatizada, zonas de spa, gimnasio, domótica de última generación, garaje para 3 o más vehículos, y en algunas urbanizaciones, servicio de portería 24 horas. Las construcciones nuevas están implementando sistemas de energía solar, aerotermia y certificaciones LEED o BREEAM.</p>

<h2>Proceso de compra de una villa en Marbella</h2>
<p>El proceso sigue los pasos estándar de una compraventa en España, pero con matices propios del mercado de lujo:</p>
<ul>
<li>Due diligence exhaustivo de la licencia de obras, el certificado de primera ocupación (o licencia de segunda ocupación) y la situación urbanística.</li>
<li>Verificación de la inexistencia de cargas, hipotecas y deudas de comunidad o IBI.</li>
<li>Negociación del precio: en Marbella, el margen de negociación habitual está entre el <strong>5 % y el 10 %</strong> sobre el precio de lista en operaciones directas.</li>
<li>Reserva y contrato de arras, habitualmente con un depósito del <strong>10 % del precio acordado</strong>.</li>
</ul>

<h2>Preguntas frecuentes</h2>

<h3>¿Cuál es el precio mínimo de una villa en Marbella?</h3>
<p>Es posible encontrar villas independientes en zonas algo alejadas del centro o en segunda línea de playa a partir de 800.000 euros. En zonas prime como la Golden Mile o Sierra Blanca, el punto de entrada para una villa de calidad está en torno a los 2 millones de euros.</p>

<h3>¿Vale la pena comprar en Benahavís frente a Marbella?</h3>
<p>Benahavís ofrece parcelas más grandes, mayor privacidad y precios algo inferiores a los de Marbella. Sin embargo, su distancia al mar y a los servicios es mayor. Es especialmente atractivo para quien prioriza la privacidad y los grandes jardines sobre la cercanía a la playa.</p>

<h3>¿Es buen momento para comprar una villa en Marbella en 2026?</h3>
<p>El consenso entre los profesionales del sector es que la demanda sólida y la escasez de suelo prime seguirán manteniendo la presión al alza sobre los precios. No se prevé una corrección significativa a corto plazo, lo que hace de 2026 un buen momento para invertir antes de que los precios continúen su ascenso.</p>

<h3>¿Qué impuestos pago al comprar una villa de segunda mano en Marbella?</h3>
<p>Comprará en Andalucía, donde el Impuesto de Transmisiones Patrimoniales (ITP) para segunda mano es del 7 % (tipo reducido establecido en 2021). Para obra nueva, el IVA es del 10 % más el AJD del 1,2 %.</p>

<p style="margin-top:2rem"><strong>¿Está buscando villa en Marbella?</strong> Disponemos de una selección confidencial de propiedades en Sierra Blanca, La Zagaleta y la Nueva Milla de Oro que no están en el mercado abierto. <a href="/propiedades" style="color:#b8942e;font-weight:600">Ver propiedades en Marbella.</a></p>`,
  },

  // ─── ESPAÑOL 6 ─────────────────────────────────────────────────
  {
    title: 'Impuestos al comprar una vivienda en España como no residente',
    slug: 'impuestos-comprar-vivienda-espana-no-residente',
    category: 'guias',
    language: 'es',
    read_time: 8,
    excerpt: 'Guía completa de los impuestos que debe pagar un comprador no residente al adquirir una vivienda en España: ITP, IVA, AJD, IRNR y más. Datos actualizados 2026.',
    meta_description: 'Impuestos comprar piso España no residente 2026: ITP, IVA, AJD, plusvalía, IRNR. Cuánto se paga exactamente y cómo calcularlo. Guía actualizada.',
    cover_image: c(IMG.legal), banner_image_url: b(IMG.legal),
    content: `<p><strong>En resumen:</strong> Comprar una vivienda en España como no residente implica el pago de impuestos en el momento de la compra (ITP o IVA+AJD) y, posteriormente, tributos anuales como el IRNR. El coste fiscal total en el momento de la compra oscila entre el <strong>7 % y el 12 %</strong> del precio escriturado, dependiendo del tipo de inmueble y la comunidad autónoma.</p>

<h2>Impuestos en el momento de la compra</h2>
<p>Los impuestos exigibles varían según si el inmueble es de obra nueva o de segunda mano:</p>

<h2>Segunda mano: Impuesto de Transmisiones Patrimoniales (ITP)</h2>
<p>El ITP es el principal impuesto al adquirir una vivienda de segunda mano. Es un impuesto cedido a las comunidades autónomas, por lo que el tipo varía según la región:</p>
<ul>
<li><strong>Andalucía:</strong> 7 % (tipo general reducido desde 2021).</li>
<li><strong>Comunidad Valenciana:</strong> 10 %.</li>
<li><strong>Cataluña:</strong> 10 %.</li>
<li><strong>Comunidad de Madrid:</strong> 6 %.</li>
<li><strong>Baleares:</strong> entre el 8 % y el 13 % según el precio del inmueble (sistema escalonado).</li>
<li><strong>Canarias:</strong> 6,5 %.</li>
</ul>

<h2>Obra nueva: IVA + Actos Jurídicos Documentados (AJD)</h2>
<p>Para las viviendas de nueva construcción adquiridas del promotor, el régimen fiscal es diferente:</p>
<ul>
<li><strong>IVA:</strong> 10 % del precio de compra (tipo reducido para vivienda habitual y segunda residencia).</li>
<li><strong>IVA vivienda de protección oficial:</strong> 4 %.</li>
<li><strong>Actos Jurídicos Documentados (AJD):</strong> entre el 0,5 % y el 1,5 % según la comunidad autónoma. En Andalucía es del 1,2 %.</li>
</ul>

<h2>Gastos notariales y registrales</h2>
<p>Además de los impuestos, la escrituración genera gastos notariales (fijados por arancel) y los gastos de inscripción en el Registro de la Propiedad. Para un inmueble de 500.000 euros, estos gastos suelen oscilar entre <strong>1.800 y 3.000 euros</strong>.</p>

<h2>Retención del 3 % en la compraventa</h2>
<p>Existe una obligación fiscal específica para compradores que adquieren un inmueble de un vendedor no residente: el comprador debe retener el <strong>3 % del precio de compra</strong> e ingresarlo en Hacienda en concepto de pago a cuenta del IRNR del vendedor. Este mecanismo no incrementa el coste fiscal del comprador, pero debe gestionarse correctamente para evitar responsabilidades subsidiarias.</p>

<h2>Impuestos anuales como propietario no residente</h2>
<p>Una vez adquirida la propiedad, el propietario no residente queda sujeto a los siguientes impuestos anuales:</p>
<ul>
<li><strong>Impuesto sobre Bienes Inmuebles (IBI):</strong> impuesto local pagado al Ayuntamiento, calculado sobre el valor catastral. Varía entre el 0,4 % y el 1,3 % del valor catastral según el municipio.</li>
<li><strong>IRNR por imputación de renta:</strong> si el inmueble no se alquila, se imputa una renta del 1,1 % del valor catastral (o el 2 % si el valor catastral no ha sido revisado en los últimos 10 años), que tributa al 19 % para residentes UE y al 24 % para el resto de países. El resultado neto suele ser una cuantía modesta.</li>
<li><strong>IRNR sobre rentas de alquiler:</strong> si el inmueble está arrendado, los ingresos netos tributan al 19 % (UE/EEE) o al 24 % (resto).</li>
</ul>

<h2>Plusvalía municipal al vender</h2>
<p>Cuando se vende la propiedad, el vendedor (no residente) está sujeto a la plusvalía municipal (IIVTNU) y al IRNR sobre la ganancia patrimonial. Tras la sentencia del Tribunal Constitucional de 2021, la plusvalía municipal solo se aplica cuando existe un incremento real de valor del suelo. El tipo de IRNR sobre la ganancia patrimonial es del 19 % para residentes UE y del 24 % para el resto.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿Qué impuestos pago en el primer año de compra?</h3>
<p>En el año de compra abonará el ITP o IVA+AJD (según el tipo de inmueble), más los gastos notariales y registrales. Si la compra se realiza a mediados de año, también deberá pagar el IRNR por imputación de renta proporcional a los meses de posesión, y el IBI proporcional (aunque suele estar a cargo del vendedor hasta la fecha de escritura).</p>

<h3>¿Puedo deducir algún gasto como no residente propietario?</h3>
<p>Sí. Los residentes de la UE o el EEE pueden deducir los gastos directamente vinculados a la obtención de rendimientos (si el inmueble está alquilado): intereses hipotecarios, seguros, gastos de comunidad, IBI, reparaciones, etc. Los no residentes de fuera de la UE no tienen derecho a estas deducciones.</p>

<h3>¿Cuándo se paga el IRNR por imputación de renta?</h3>
<p>El IRNR por imputación de renta se presenta mediante el modelo 210 y debe presentarse entre el 1 de enero y el 31 de diciembre del año siguiente al ejercicio declarado. No tiene retenciones anticipadas.</p>

<h3>¿Hay que pagar impuesto de patrimonio en España?</h3>
<p>Sí. España aplica el Impuesto sobre el Patrimonio a los no residentes por los bienes situados en territorio español. El mínimo exento es de 700.000 euros. Para patrimonios superiores, los tipos oscilan entre el 0,2 % y el 3,5 % según la comunidad autónoma.</p>

<p style="margin-top:2rem"><strong>¿Necesita asesoramiento fiscal para su compra en España?</strong> Nuestros asesores trabajan con abogados fiscalistas especializados en compradores no residentes. <a href="/contacto" style="color:#b8942e;font-weight:600">Contactar con un asesor.</a></p>`,
  },

  // ─── ESPAÑOL 7 ─────────────────────────────────────────────────
  {
    title: 'Invertir en Tulum: ¿es buen momento? Análisis 2026',
    slug: 'invertir-en-tulum-analisis-2026',
    category: 'inversion',
    language: 'es',
    read_time: 8,
    excerpt: 'Tulum se ha convertido en uno de los mercados inmobiliarios de mayor crecimiento en el Caribe mexicano. Analizamos rentabilidades, riesgos y zonas de inversión en 2026.',
    meta_description: 'Invertir en Tulum 2026: rentabilidades, precios por zona, riesgos y oportunidades. Análisis del mercado inmobiliario del Caribe mexicano para inversores internacionales.',
    cover_image: c(IMG.tulum), banner_image_url: b(IMG.tulum),
    content: `<p><strong>En resumen:</strong> Tulum ha experimentado una de las apreciaciones más intensas del mercado inmobiliario latinoamericano en los últimos cinco años, con incrementos de precio del <strong>60–120 %</strong> en algunas zonas entre 2019 y 2024. La rentabilidad del alquiler vacacional supera el 8 % bruto anual en propiedades bien gestionadas. Sin embargo, el mercado también presenta riesgos específicos que el inversor debe conocer y gestionar.</p>

<h2>El auge inmobiliario de Tulum</h2>
<p>Tulum pasó de ser un destino de mochileros a convertirse en uno de los puntos de mayor interés para la inversión inmobiliaria internacional en la región del Caribe. Varios factores explican este cambio: la construcción del Tren Maya (inaugurado parcialmente en 2023), la consolidación de Tulum como destino de wellness y lujo, y la creciente demanda de propietarios estadounidenses, canadienses y europeos que buscan una segunda residencia o activos de alquiler vacacional.</p>
<p>En 2024, el municipio de Tulum registró más de <strong>2,1 millones de visitantes</strong>, con una ocupación hotelera media superior al 82 % en temporada alta. El aeropuerto internacional de Tulum, inaugurado en 2024, facilita conexiones directas desde Estados Unidos, Canadá y Europa.</p>

<h2>Precios actuales y revalorización histórica</h2>
<p>Los precios varían significativamente según la zona:</p>
<ul>
<li><strong>Zona Hotelera (frente al mar):</strong> 4.500–9.000 USD/m² para desarrollos de lujo frente al océano.</li>
<li><strong>Aldea Zamá:</strong> el fraccionamiento residencial más establecido. 2.800–5.500 USD/m².</li>
<li><strong>La Veleta / Región 15:</strong> zona en expansión, 1.800–3.500 USD/m². Mayor potencial de revalorización a corto plazo.</li>
<li><strong>Selvática / Zona Sélvica:</strong> desarrollo sostenible en entorno natural. 2.200–4.000 USD/m².</li>
</ul>
<p>La revalorización media anual entre 2019 y 2024 fue del <strong>15–22 % anual</strong> en Aldea Zamá y del 25–35 % en zonas más periféricas que se han urbanizado en este periodo.</p>

<h2>Rentabilidad del alquiler vacacional</h2>
<p>Tulum ofrece rentabilidades de alquiler vacacional superiores a la mayoría de destinos europeos equivalentes:</p>
<ul>
<li>Ocupación media anual en propiedades gestionadas profesionalmente: <strong>68–78 %</strong>.</li>
<li>Tarifa media por noche (apartamento 1 dormitorio): 150–280 USD en temporada media.</li>
<li>Tarifa media por noche en temporada alta (enero–marzo, julio): 300–600 USD.</li>
<li>Yield bruto anual estimado: <strong>7–12 %</strong> para propiedades bien ubicadas y gestionadas.</li>
</ul>

<h2>Riesgos específicos del mercado de Tulum</h2>
<p>Invertir en Tulum presenta riesgos que no existen en mercados como España o Dubai:</p>
<ul>
<li><strong>Régimen de propiedad en zona restringida:</strong> los extranjeros no pueden poseer directamente terrenos dentro de los 50 km de la costa o 100 km de fronteras. La solución habitual es el Fideicomiso (trust bancario), que otorga plenos derechos de uso y disposición al extranjero con un coste anual de 500–800 USD.</li>
<li><strong>Riesgo de construcción:</strong> existen numerosos proyectos preventa de dudosa solvencia. Es imprescindible verificar la experiencia del promotor, los permisos y el historial de entrega.</li>
<li><strong>Sobreoferta en algunas zonas:</strong> el boom ha generado un exceso de oferta en algunos segmentos, especialmente en estudios y apartamentos de un dormitorio estándar.</li>
<li><strong>Regulación ambiental:</strong> Tulum colinda con la Reserva de la Biosfera Sian Ka'an. Las normativas ambientales son estrictas y pueden limitar el desarrollo de proyectos en zonas próximas.</li>
</ul>

<h2>Perfil del inversor ideal para Tulum</h2>
<p>Tulum es más adecuado para inversores con horizonte de 5–10 años, tolerancia al riesgo moderada-alta, y disposición a gestionar activamente la propiedad o contratar gestión profesional. No es un mercado para inversores conservadores que buscan rentas estables sin volatilidad.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿Pueden los extranjeros comprar propiedades en Tulum?</h3>
<p>Sí, mediante el Fideicomiso, que es un instrumento legal que otorga al extranjero todos los derechos de uso, arrendamiento y venta. El coste anual del fideicomiso es de 500–800 USD. Existe también la opción de comprar a través de una empresa mexicana constituida al efecto.</p>

<h3>¿Cuál es el ticket de entrada mínimo para invertir en Tulum?</h3>
<p>Es posible encontrar proyectos preventa desde 120.000 USD para un estudio. El rango más habitual para inversiones de calidad oscila entre 250.000 y 600.000 USD por una unidad de 1 o 2 dormitorios en desarrollo establecido.</p>

<h3>¿Cuánto se puede ganar con el alquiler vacacional en Tulum?</h3>
<p>Una propiedad de 2 dormitorios bien ubicada en Aldea Zamá puede generar entre 35.000 y 65.000 USD anuales de ingresos brutos por alquiler vacacional, con una ocupación del 65–75 % anual. Los gastos de gestión, mantenimiento y plataformas representan aproximadamente el 30–40 % de los ingresos brutos.</p>

<h3>¿Hay riesgo de huracanes en Tulum?</h3>
<p>Sí. La Riviera Maya está en zona de influencia de huracanes atlánticos. El Caribe mexicano ha recibido impactos de tormentas tropicales de diversa intensidad. Los desarrollos de calidad incorporan construcción antisísmica y resistente al viento, así como seguros obligatorios. Es imprescindible contratar seguro de huracán para cualquier propiedad en la zona.</p>

<p style="margin-top:2rem"><strong>¿Le interesa invertir en Tulum o la Riviera Maya?</strong> Contamos con proyectos seleccionados en Aldea Zamá y La Veleta con promotores de probada solvencia. <a href="/propiedades" style="color:#b8942e;font-weight:600">Ver propiedades en Tulum.</a></p>`,
  },

  // ─── ESPAÑOL 8 ─────────────────────────────────────────────────
  {
    title: 'Rentabilidad del alquiler vacacional en Costa del Sol',
    slug: 'rentabilidad-alquiler-vacacional-costa-del-sol',
    category: 'inversion',
    language: 'es',
    read_time: 7,
    excerpt: 'Análisis de la rentabilidad real del alquiler vacacional en la Costa del Sol: zonas más rentables, tarifas medias, ocupación y costes operativos en 2026.',
    meta_description: 'Rentabilidad alquiler vacacional Costa del Sol 2026: yields por zona, tarifas, ocupación media y costes. Cuánto puede ganar con una propiedad en Marbella, Estepona o Nerja.',
    cover_image: c(IMG.invest), banner_image_url: b(IMG.invest),
    content: `<p><strong>En resumen:</strong> La Costa del Sol ofrece rentabilidades brutas del alquiler vacacional de entre el <strong>4,5 % y el 8 %</strong> anual, dependiendo de la zona, el tipo de propiedad y la calidad de gestión. La temporada alta se extiende de mayo a octubre, con picos en julio y agosto y una cada vez más larga temporada media que eleva los ingresos anuales.</p>

<h2>El mercado del alquiler vacacional en la Costa del Sol</h2>
<p>La Costa del Sol es el primer destino vacacional de España por volumen de visitantes internacionales. En 2024, la provincia de Málaga recibió más de <strong>14 millones de turistas</strong>, de los cuales el 65 % pernoctaron en alojamientos no hoteleros (apartamentos y villas de alquiler). Este dato subraya la solidez estructural del mercado de alquiler vacacional en la zona.</p>

<h2>Yields por zona en 2026</h2>
<ul>
<li><strong>Marbella (Golden Mile, Puerto Banús):</strong> 4,5–6 % bruto anual. Precios altos que moderan el yield pero garantizan estabilidad.</li>
<li><strong>Estepona / Nueva Milla de Oro:</strong> 5–7 % bruto. Mejor ecuación entre precio de adquisición y potencial de ingresos.</li>
<li><strong>Fuengirola / Torremolinos:</strong> 5,5–8 % bruto. Precio de entrada más bajo, alta ocupación durante 8–9 meses.</li>
<li><strong>Nerja / Frigiliana:</strong> 6–9 % bruto. Alta demanda y oferta limitada hacen de esta zona una de las más rentables.</li>
<li><strong>Mijas Costa / Calahonda:</strong> 5–7 % bruto. Equilibrio entre precio de compra y demanda turística.</li>
</ul>

<h2>Datos de ocupación y tarifas medias</h2>
<p>Los datos medios para el mercado de Costa del Sol en 2025 muestran:</p>
<ul>
<li>Ocupación media anual en apartamentos de 2 dormitorios gestionados por agencia: <strong>65–75 %</strong>.</li>
<li>Tarifa por noche en julio-agosto (2 dormitorios, buen estado): <strong>180–350 euros</strong>.</li>
<li>Tarifa en temporada media (mayo-junio, septiembre-octubre): <strong>100–180 euros</strong>.</li>
<li>Tarifa en temporada baja (noviembre-abril): <strong>60–100 euros</strong>.</li>
</ul>
<p>Un apartamento de 2 dormitorios en buenas condiciones en Estepona puede generar <strong>entre 22.000 y 35.000 euros brutos anuales</strong>.</p>

<h2>Costes operativos del alquiler vacacional</h2>
<p>Los principales costes que reducen el yield bruto son:</p>
<ul>
<li><strong>Comisión de gestión:</strong> entre el 20 % y el 30 % de los ingresos brutos para empresas de gestión integral.</li>
<li><strong>Limpieza entre estancias:</strong> 60–120 euros por rotación de inquilino.</li>
<li><strong>Suministros (luz, agua, internet):</strong> entre 150 y 300 euros mensuales.</li>
<li><strong>Comunidad de propietarios e IBI:</strong> variable según la urbanización, estimado en 2.000–5.000 euros anuales.</li>
<li><strong>Mantenimiento y pequeñas reparaciones:</strong> reservar un 1–1,5 % del valor del inmueble anualmente.</li>
</ul>
<p>La rentabilidad neta real, deducidos todos los gastos, suele situarse entre el <strong>3 % y el 5 %</strong> para propiedades bien gestionadas.</p>

<h2>Licencia de alquiler vacacional en Andalucía</h2>
<p>Para arrendar turísticamente en Andalucía es necesario inscribir el inmueble en el Registro de Turismo de Andalucía. El proceso requiere presentar una declaración responsable y acreditar que el inmueble cumple los estándares mínimos de habitabilidad. El número de registro debe figurar en todos los anuncios en plataformas como Airbnb o Booking.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿Cuánto se puede ganar alquilando una villa en Marbella?</h3>
<p>Una villa de 4 dormitorios con piscina en una zona media de Marbella puede generar entre 60.000 y 120.000 euros brutos anuales con gestión profesional y una ocupación del 60–70 %. Las villas en zonas ultra-prime con piscina climatizada y domótica pueden superar los 200.000 euros anuales en ingresos brutos.</p>

<h3>¿Es mejor gestionar el alquiler personalmente o contratar una agencia?</h3>
<p>Para propietarios no residentes, la gestión a través de una agencia especializada es casi imprescindible. Aunque la comisión reduce el yield bruto en 20–30 puntos, la profesionalidad en la gestión de reservas, la atención al inquilino y el mantenimiento suelen incrementar la ocupación neta y preservar mejor el valor del inmueble.</p>

<h3>¿Se pueden alquilar inmuebles en comunidades que lo prohíben?</h3>
<p>No. Muchas comunidades de propietarios en la Costa del Sol han aprobado estatutos que prohíben el alquiler turístico. Antes de comprar con intención de arrendar, es imprescindible verificar los estatutos de la comunidad y si existe prohibición vigente o en trámite.</p>

<h3>¿Cuál es la tributación de los ingresos de alquiler para no residentes?</h3>
<p>Los no residentes de la UE tributan sobre los ingresos netos al 19 %. Los residentes fuera de la UE al 24 %, sin posibilidad de deducir gastos. Es obligatorio presentar el modelo 210 trimestralmente si se perciben ingresos de alquiler.</p>

<p style="margin-top:2rem"><strong>¿Quiere calcular la rentabilidad de una propiedad específica?</strong> Nuestro equipo realiza estudios de viabilidad para inversiones en Costa del Sol. <a href="/contacto" style="color:#b8942e;font-weight:600">Solicitar valoración gratuita.</a></p>`,
  },

  // ─── ESPAÑOL 9 ─────────────────────────────────────────────────
  {
    title: 'Comprar propiedad en Dubai siendo latino: guía 2026',
    slug: 'comprar-propiedad-dubai-siendo-latino-guia-2026',
    category: 'guias',
    language: 'es',
    read_time: 9,
    excerpt: 'Dubai se ha convertido en el destino favorito para la inversión inmobiliaria de latinoamericanos de alto poder adquisitivo. Guía completa sobre el proceso, impuestos y ventajas en 2026.',
    meta_description: 'Comprar propiedad en Dubai siendo latino 2026: proceso legal, impuestos (0 %), financiación, zonas recomendadas y visa dorada. Guía para inversores latinoamericanos.',
    cover_image: c(IMG.dubai), banner_image_url: b(IMG.dubai),
    content: `<p><strong>En resumen:</strong> Dubai ofrece a los inversores latinoamericanos un mercado inmobiliario con <strong>0 % de impuestos</strong> sobre rentas y ganancias patrimoniales, rendimientos de alquiler del 5–9 % bruto anual, y la posibilidad de obtener la visa de residencia con inversiones desde 205.000 dólares. La seguridad jurídica y la transparencia del mercado son comparables a los mejores mercados europeos.</p>

<h2>Por qué Dubai atrae al inversor latinoamericano</h2>
<p>En los últimos cinco años, Dubai ha captado una cantidad creciente de capital procedente de México, Colombia, Venezuela, Argentina y Brasil. Las razones son múltiples: la inexistencia de impuestos sobre la renta, la posibilidad de operar con dólares estadounidenses, la estabilidad política del emirato y la fortaleza de su mercado inmobiliario.</p>
<p>En 2024, los latinoamericanos representaron el <strong>8 % de los compradores extranjeros</strong> en Dubai, con un ticket medio de transacción de 620.000 dólares. México, Venezuela y Colombia lideran las nacionalidades latinoamericanas compradoras.</p>

<h2>Régimen fiscal: las ventajas para el inversor</h2>
<p>Dubai no aplica los siguientes tributos que sí existen en España u otros mercados:</p>
<ul>
<li><strong>Sin impuesto sobre la renta:</strong> los ingresos por alquiler son libres de impuestos en Dubai.</li>
<li><strong>Sin impuesto sobre ganancias patrimoniales:</strong> la venta de la propiedad no genera ninguna tributación local.</li>
<li><strong>Sin impuesto sobre el patrimonio.</strong></li>
<li><strong>Sin impuesto de herencias.</strong></li>
</ul>
<p>Los únicos costes fiscales al comprar son el <strong>Impuesto de Registro (DLD Transfer Fee)</strong> del 4 % del precio de compra, pagadero a la Autoridad Territorial de Dubai, y los gastos de escrituración y agencia (1–2 %).</p>

<h2>Zonas recomendadas para el inversor latinoamericano</h2>
<ul>
<li><strong>Downtown Dubai / Burj Khalifa:</strong> máximo prestige y liquidez. Precios desde 5.000 AED/m² (≈ 1.360 USD/m²). Ideal para alquiler a corto plazo y revalorización.</li>
<li><strong>Dubai Marina / JBR:</strong> zona costera con alta demanda de alquiler vacacional. 4.200–7.500 AED/m².</li>
<li><strong>Palm Jumeirah:</strong> exclusividad y alto retorno. Precios de 8.000–18.000 AED/m² según tipo de unidad. Villas y áticos con vistas al golfo.</li>
<li><strong>Business Bay:</strong> zona de negocios en plena expansión. 3.800–6.500 AED/m². Buena demanda de alquiler de larga estancia.</li>
<li><strong>Dubai Hills Estate:</strong> zona residencial familiar con campo de golf. 4.500–7.000 AED/m². Muy demandada por familias y profesionales.</li>
</ul>

<h2>Cómo comprar: proceso legal</h2>
<p>El proceso de compra en Dubai está regulado por la Dubai Land Authority (DLD) y es muy ágil:</p>
<ul>
<li><strong>Selección de propiedad y firma del MOU</strong> (Memorandum of Understanding): similar al contrato de arras, con depósito del 10 %.</li>
<li><strong>Obtención del No Objection Certificate (NOC)</strong> del promotor (solo necesario en reventa de unidades en construcción).</li>
<li><strong>Transferencia ante la DLD</strong>: la propiedad queda registrada de forma inmediata. No hay registro notarial como en España.</li>
<li><strong>Pago del DLD Transfer Fee (4 %) y entrega de llaves.</strong></li>
</ul>
<p>El proceso completo puede completarse en <strong>5 a 15 días hábiles</strong> en el caso de propiedades terminadas.</p>

<h2>Visa de residencia por inversión inmobiliaria</h2>
<ul>
<li><strong>Visa de 2 años:</strong> para inversiones inmobiliarias desde 205.000 USD (750.000 AED).</li>
<li><strong>Golden Visa de 10 años:</strong> para inversiones desde 545.000 USD (2.000.000 AED). Renovable indefinidamente. Incluye familia inmediata.</li>
</ul>
<p>La Golden Visa de Dubai es actualmente una de las opciones más utilizadas por latinoamericanos como vía de residencia alternativa, especialmente como "plan B" ante incertidumbres políticas o fiscales en su país de origen.</p>

<h2>Preguntas frecuentes</h2>

<h3>¿Pueden los latinoamericanos comprar propiedades en Dubai?</h3>
<p>Sí. Dubai permite la compra de propiedades en freehold (pleno dominio) a extranjeros de cualquier nacionalidad en las zonas designadas (Designated Freehold Areas), que incluyen las zonas más demandadas del emirato como Dubai Marina, Downtown, Palm Jumeirah y Business Bay.</p>

<h3>¿Se puede financiar la compra en Dubai siendo extranjero?</h3>
<p>Sí. Los bancos en Dubai ofrecen hipotecas a extranjeros no residentes, con financiación de hasta el 50 % del valor del inmueble. Los tipos hipotecarios en el emirato se sitúan entre el 4 % y el 5,5 % anual actualmente.</p>

<h3>¿Cuánto se gana con el alquiler en Dubai?</h3>
<p>La rentabilidad bruta del alquiler en Dubai es de las más altas entre los mercados de primera línea mundial. Los apartamentos en Dubai Marina o Business Bay generan yields brutos del 6–8 % anual. Las villas en Palm Jumeirah pueden superar el 5–6 % bruto.</p>

<h3>¿Es seguro invertir en propiedades en construcción en Dubai?</h3>
<p>Los proyectos en construcción (off-plan) son una forma muy habitual de invertir en Dubai, con planes de pago flexibles durante la construcción. La DLD regula estrictamente los pagos: los fondos de los compradores se depositan en cuentas escrow controladas por el gobierno, lo que mitiga el riesgo de impago del promotor.</p>

<p style="margin-top:2rem"><strong>¿Le interesa invertir en Dubai?</strong> Nuestros asesores especializados en el mercado de Dubai pueden presentarle una selección de proyectos adaptados a su presupuesto y objetivo. <a href="/propiedades" style="color:#b8942e;font-weight:600">Ver propiedades en Dubai.</a></p>`,
  },

  // ─── ESPAÑOL 10 ─────────────────────────────────────────────────
  {
    title: 'Las mejores zonas para comprar en Estepona en 2026',
    slug: 'mejores-zonas-comprar-estepona-2026',
    category: 'zonas',
    language: 'es',
    read_time: 7,
    excerpt: 'Estepona se ha convertido en la alternativa de lujo a Marbella. Analizamos las mejores zonas para comprar en 2026, precios actuales y perspectivas de revalorización.',
    meta_description: 'Mejores zonas para comprar piso en Estepona 2026: Nueva Milla de Oro, casco antiguo, Cancelada. Precios, revalorización y oportunidades de inversión.',
    cover_image: c(IMG.estepona), banner_image_url: b(IMG.estepona),
    content: `<p><strong>En resumen:</strong> Estepona ha pasado de ser la vecina más tranquila de Marbella a uno de los mercados inmobiliarios de mayor dinamismo de la Costa del Sol. Los precios crecieron un <strong>11,3 % en 2024</strong>, con zonas como la Nueva Milla de Oro registrando incrementos superiores al 15 %. La escasez de suelo urbanizable y la continua llegada de grandes promotoras nacionales e internacionales anticipan una revalorización sostenida.</p>

<h2>Por qué Estepona es la nueva apuesta de lujo en Costa del Sol</h2>
<p>Estepona combina lo mejor de la Costa del Sol sin las fricciones de tráfico y masificación que afectan a Marbella en temporada alta. Su casco antiguo, distinguido como uno de los más bonitos de Andalucía, sus más de 20 kilómetros de playas de arena fina y la reciente regeneración urbanística lo han posicionado como destino de primera residencia y segunda residencia de alto standing.</p>
<p>El traslado de grandes promotoras como Taylor Wimpey, Neinor Homes, Aedas y varias promotoras luxemburguesas e irlandesas a la zona ha impulsado una nueva generación de desarrollos residenciales de calidad superior.</p>

<h2>Las principales zonas de compra en Estepona</h2>

<h2>Nueva Milla de Oro</h2>
<p>El corredor entre Estepona y Marbella, conocido como la Nueva Milla de Oro, es actualmente la zona de mayor atracción para el inversor internacional. Urbanizaciones como Cancelada, Seghers y Los Flamingos concentran proyectos de villas y apartamentos de alta gama. Los precios oscilan entre <strong>3.500 y 6.500 euros por metro cuadrado</strong>, con valores en primera línea de golf o con vistas al mar que alcanzan los 8.000 euros/m² en las promociones más exclusivas.</p>

<h2>Casco antiguo de Estepona</h2>
<p>El casco urbano, completamente rehabilitado en la última década, tiene una alta demanda de compradores europeos que buscan apartamentos auténticos en el centro histórico. Los precios son más moderados (2.500–4.000 euros/m²) y la demanda de alquiler a largo plazo es sólida, lo que lo convierte en una opción de inversión con rendimientos estables.</p>

<h2>Atalaya / Costalita</h2>
<p>Zona residencial consolidada entre Estepona y San Pedro de Alcántara, con urbanizaciones de planta baja y apartamentos de 2–3 dormitorios. Los precios van de 3.000 a 5.500 euros/m². Alta demanda escandinava y alemana. Excelentes comunicaciones por carretera con Marbella y Gibraltar.</p>

<h2>Selwo / Cancelada</h2>
<p>Próxima al Parque Selwo y la zona hotelera del Kempinski, con proyectos de obra nueva de alta calidad. La demanda de compradores latinoamericanos y de Oriente Medio ha crecido notablemente en los últimos dos años. Precios de 3.200 a 5.800 euros/m².</p>

<h2>Tendencias del mercado en 2026</h2>
<p>El mercado de Estepona presenta varias tendencias que el inversor debe conocer:</p>
<ul>
<li>La escasez de suelo urbanizable en el término municipal limita la oferta nueva, sosteniendo la presión al alza en los precios.</li>
<li>El alquiler vacacional en Estepona registra ocupaciones medias del <strong>72 %</strong> anual para propiedades gestionadas profesionalmente.</li>
<li>La mejora de la conexión de trenes de cercanías con Málaga y el futuro AVE incrementará la accesibilidad desde el aeropuerto internacional.</li>
</ul>

<h2>Preguntas frecuentes</h2>

<h3>¿Es mejor comprar en Estepona o en Marbella?</h3>
<p>Para un presupuesto de 500.000–1.000.000 euros, Estepona ofrece mayor superficie construida por el mismo importe que en Marbella, junto a un entorno más tranquilo. Para compradores que priorizan el prestigio de la marca y la proximidad a Puerto Banús, Marbella sigue siendo la referencia indiscutible.</p>

<h3>¿Qué rentabilidad ofrece el alquiler en Estepona?</h3>
<p>Los apartamentos de 2 dormitorios en buenas urbanizaciones generan entre 18.000 y 28.000 euros brutos anuales en alquiler vacacional. Las villas con piscina pueden superar los 50.000 euros en ingresos brutos anuales.</p>

<h3>¿Hay buenas escuelas internacionales en Estepona?</h3>
<p>La zona cuenta con varias escuelas internacionales de referencia a corta distancia: Sotogrande International School (20 min), Laude San Pedro International College (10 min) y el colegio internacional de Marbella (25 min). Esto la hace muy adecuada para familias con hijos en edad escolar.</p>

<h3>¿Cuánto cuesta el mantenimiento de una propiedad en Estepona?</h3>
<p>Los gastos de comunidad en urbanizaciones con piscina y jardines varían entre 150 y 500 euros mensuales. El IBI suele representar entre 800 y 2.500 euros anuales para propiedades de 300.000–800.000 euros. Los seguros del hogar rondan entre 400 y 1.200 euros anuales.</p>

<p style="margin-top:2rem"><strong>¿Busca propiedad en Estepona o la Nueva Milla de Oro?</strong> Disponemos de una selección actualizada de apartamentos y villas en las mejores zonas. <a href="/propiedades" style="color:#b8942e;font-weight:600">Ver propiedades en Estepona.</a></p>`,
  },

  // ══════════════════════════════════════
  // ENGLISH POSTS (10)
  // ══════════════════════════════════════

  // ─── ENGLISH 1 ─────────────────────────────────────────────────
  {
    title: 'Buying Property in Spain as a Foreigner: Complete 2026 Guide',
    slug: 'buying-property-spain-foreigner-2026',
    category: 'guides',
    language: 'en',
    read_time: 9,
    excerpt: 'Everything international buyers need to know about purchasing property in Spain in 2026: legal requirements, taxes, process timeline and the most sought-after locations.',
    meta_description: 'Complete 2026 guide to buying property in Spain as a foreigner. Legal requirements, NIE, taxes, process steps and top locations. Expert advice for international buyers.',
    cover_image: c(IMG.arch), banner_image_url: b(IMG.arch),
    content: `<p><strong>Summary:</strong> Foreign nationals can purchase property in Spain without restrictions, regardless of nationality or residency status. The process requires a NIE (tax identification number), a Spanish bank account and legal due diligence. Additional purchase costs represent <strong>10–14 %</strong> of the purchase price. International buyers accounted for <strong>15.8 %</strong> of all residential transactions in Spain in 2024, with demand concentrated along the Mediterranean coast.</p>

<h2>Can Foreigners Buy Property in Spain?</h2>
<p>Spain imposes no restrictions on foreign property ownership. Any individual, regardless of nationality or country of residence, may freely acquire residential, commercial or rural property in Spain. This openness makes Spain one of the most accessible and legally secure property markets in Europe for international investors.</p>
<p>The coastal provinces of Malaga, Alicante and the Balearic Islands attract the highest concentration of foreign buyers. In the Costa del Sol, international purchasers account for over <strong>35 %</strong> of all residential transactions annually.</p>

<h2>Required Documentation</h2>
<p>To complete a property purchase in Spain as a foreign national, you will need:</p>
<ul>
<li><strong>NIE (Número de Identidad de Extranjero):</strong> mandatory tax identification number for all economic transactions in Spain.</li>
<li><strong>Valid passport:</strong> must remain valid throughout the entire purchase process.</li>
<li><strong>Spanish bank account:</strong> required for payment of the purchase price, taxes and ongoing property costs.</li>
<li><strong>Power of attorney:</strong> if you cannot be present for the notarial signing, a Spanish lawyer can act on your behalf.</li>
</ul>

<h2>Step-by-Step Purchase Process</h2>
<ul>
<li><strong>Obtain your NIE:</strong> apply at the Spanish consulate in your home country or at a police station in Spain. Processing time: 2–4 weeks.</li>
<li><strong>Legal due diligence:</strong> your lawyer will verify the property's legal status, outstanding charges, planning permissions and compliance with building regulations.</li>
<li><strong>Private purchase contract (arras):</strong> exchange of contracts with a deposit of typically 10 % of the agreed price. At this stage the vendor is contractually bound to sell.</li>
<li><strong>Mortgage application (if required):</strong> Spanish banks finance up to 70 % of the appraised value for non-residents.</li>
<li><strong>Notarial deed (escritura pública):</strong> final signing before a Spanish notary with payment of the balance.</li>
<li><strong>Land Registry inscription:</strong> provides full legal protection of your ownership rights.</li>
</ul>
<p>The typical timeline between exchange of contracts and completion is <strong>30 to 90 days</strong>.</p>

<h2>Purchase Taxes and Costs in 2026</h2>
<p>In addition to the purchase price, buyers should budget for the following:</p>
<ul>
<li><strong>New-build properties:</strong> VAT at 10 % + Stamp Duty (AJD) at 0.5–1.5 % depending on the region.</li>
<li><strong>Resale properties:</strong> Transfer Tax (ITP) at 6–10 % depending on the region. In Andalusia, the standard rate is 7 %.</li>
<li><strong>Notary and Land Registry fees:</strong> approximately 1,000–2,500 euros depending on the purchase price.</li>
<li><strong>Legal fees:</strong> typically 1–1.5 % of the purchase price.</li>
</ul>
<p>Total additional costs will typically represent <strong>10–14 %</strong> of the purchase price.</p>

<h2>Mortgages for Non-Residents</h2>
<p>Spanish banks offer mortgages to non-residents, typically up to <strong>60–70 % of the appraised value</strong> with a maximum term of 20–25 years. Current mortgage rates range from 3.2–4.1 % for variable-rate mortgages and 3.5–4.5 % for fixed-rate products. Securing a binding mortgage offer before exchanging contracts is strongly recommended.</p>

<h2>Most Popular Locations for International Buyers in 2026</h2>
<p>The most sought-after destinations among foreign buyers are the Costa del Sol (Marbella, Estepona, Benahavis), Costa Blanca (Alicante, Javea, Altea), Mallorca, Ibiza, Barcelona and Madrid. Prime property prices in Marbella exceed <strong>5,000 euros per square metre</strong> in the most desirable locations.</p>

<h2>Frequently Asked Questions</h2>

<h3>Do I need to be a resident to buy property in Spain?</h3>
<p>No. Any foreign national can purchase property in Spain without being a resident or intending to become one. You simply need a NIE and a Spanish bank account to complete the transaction.</p>

<h3>How long does the NIE application take?</h3>
<p>At Spanish consulates abroad, processing typically takes 2–4 weeks. When applied for in Spain in person, it can be obtained on the same day or within 2–5 business days depending on the local office.</p>

<h3>What taxes does a non-resident property owner pay annually?</h3>
<p>Non-residents are subject to the Non-Resident Income Tax (IRNR). If the property is vacant, a deemed rental income of 1.1 % of the cadastral value is taxed at 19 % for EU residents and 24 % for all others. If the property is rented, net rental income is taxed at the same rates.</p>

<h3>Is buying property in Spain safe for foreigners?</h3>
<p>Yes. The Spanish property registration system offers robust legal protection to bona fide purchasers. Registering your purchase at the Land Registry protects against hidden charges and third-party claims. Engaging an independent Spanish lawyer is the most important safeguard.</p>

<h3>Can I rent out the property when not in use?</h3>
<p>Yes, subject to obtaining a tourist rental licence. In Andalusia, the registration process is relatively straightforward. Regulations vary significantly between autonomous communities, with the Balearic Islands applying the most restrictive rules.</p>

<p style="margin-top:2rem"><strong>Ready to begin your Spanish property search?</strong> Our team of international property specialists is available to guide you through every stage of the process. <a href="/contacto" style="color:#b8942e;font-weight:600">Contact us for a complimentary consultation.</a></p>`,
  },

  // ─── ENGLISH 2 ─────────────────────────────────────────────────
  {
    title: 'Spanish Golden Visa: Residency Through Property Investment in 2026',
    slug: 'spanish-golden-visa-2026',
    category: 'investment',
    language: 'en',
    read_time: 8,
    excerpt: 'The Spanish Golden Visa grants residency to investors purchasing property worth at least 500,000 euros. Full guide on requirements, process, benefits and the most popular locations in 2026.',
    meta_description: 'Spanish Golden Visa 2026: property investment requirements, application process, benefits and eligible locations. How to obtain Spanish residency through real estate investment.',
    cover_image: c(IMG.beach), banner_image_url: b(IMG.beach),
    content: `<p><strong>Summary:</strong> The Spanish Golden Visa grants residency to non-EU investors who purchase property worth a minimum of <strong>500,000 euros free of mortgages</strong>. The permit covers the investor, spouse, dependent children and dependent parents. It allows free movement across the Schengen Area and does not require physical residence in Spain to maintain validity. Over <strong>14,000 investors and families</strong> have obtained Spanish residency through this programme since its launch in 2013.</p>

<h2>What Is the Spanish Golden Visa?</h2>
<p>Introduced in 2013 under Law 14/2013, the Spanish Investor Visa programme was designed to attract foreign capital to the Spanish economy. The real estate route is by far the most popular, accounting for approximately 90 % of all Golden Visa applications. The programme has proven particularly attractive to investors from Latin America, the United States, the Middle East and China.</p>

<h2>Investment Requirements</h2>
<ul>
<li><strong>Minimum investment:</strong> 500,000 euros in Spanish real estate, free of mortgage or other charges.</li>
<li>The investment may be spread across multiple properties, provided the combined unencumbered value reaches the threshold.</li>
<li>All property types qualify: residential, commercial, industrial or land.</li>
<li>The property must be registered in the name of the investor applicant.</li>
</ul>

<h2>Key Benefits</h2>
<ul>
<li><strong>Family reunification:</strong> spouse, minor children, adult economically-dependent children and dependent parents are all included in the application.</li>
<li><strong>Schengen freedom of movement:</strong> unrestricted access to all 26 Schengen countries.</li>
<li><strong>No minimum stay requirement:</strong> there is no obligation to reside in Spain to maintain or renew the Golden Visa.</li>
<li><strong>Pathway to permanent residency and citizenship:</strong> after 5 years of continuous legal residence, permanent residency may be obtained. After 10 years, Spanish citizenship can be applied for.</li>
<li><strong>Access to the Spanish healthcare and education system</strong> for all family members included in the application.</li>
</ul>

<h2>Application Process</h2>
<ul>
<li><strong>Step 1 — Complete the property purchase:</strong> the purchase deed must be registered at the Land Registry.</li>
<li><strong>Step 2 — Investor visa application:</strong> submitted at the Spanish consulate in your country of residence, along with the registered deed, Land Registry certificate and supporting documentation.</li>
<li><strong>Step 3 — Entry into Spain and residency permit:</strong> once in Spain, apply for the Investor Residency Card at the Immigration Office.</li>
<li><strong>Step 4 — Renewal:</strong> the initial authorisation is granted for 2 years and can be renewed for 5-year periods provided the investment is maintained.</li>
</ul>
<p>The standard processing time for the initial visa is <strong>20 business days</strong>, though in practice timelines of 30–45 days are common during periods of high demand.</p>

<h2>Most Popular Locations for Golden Visa Investors</h2>
<p>The most sought-after areas for Golden Visa real estate investment are:</p>
<ul>
<li><strong>Marbella and Benahavis (Costa del Sol):</strong> the highest concentration of properties above the 500,000-euro threshold in Spain, combined with an established luxury market and strong rental demand.</li>
<li><strong>Madrid:</strong> Salamanca and Chamberi districts, as well as gated communities in the northwest (La Moraleja, Pozuelo).</li>
<li><strong>Barcelona:</strong> Pedralbes, Sarria and properties along Passeig de Gracia.</li>
<li><strong>Mallorca:</strong> the island has seen strong demand from US and Northern European Golden Visa applicants.</li>
</ul>

<h2>Tax Implications</h2>
<p>Obtaining the Golden Visa does not automatically make you a Spanish tax resident. Spanish tax residency is triggered by spending more than <strong>183 days per year</strong> in Spain. Many Golden Visa holders choose to maintain their tax residency in their home country, paying Spanish Non-Resident Income Tax (IRNR) only on income generated from Spanish sources.</p>

<h2>Frequently Asked Questions</h2>

<h3>Is the Spanish Golden Visa still available in 2026?</h3>
<p>Yes. As of publication, the Spanish Golden Visa programme for real estate investors remains in force. While there have been political discussions about potential reform, no legislative changes to the 500,000-euro threshold have been enacted.</p>

<h3>Can I split the 500,000 euros across multiple properties?</h3>
<p>Yes. The law permits the investment to be distributed across several properties, provided the combined unencumbered value meets or exceeds the minimum threshold. Each property must be registered in the name of the investor.</p>

<h3>Does the Golden Visa allow me to work in Spain?</h3>
<p>Yes. Golden Visa holders are authorised to work in Spain, whether as an employee or self-employed, from the moment the residency permit is granted.</p>

<h3>What happens if I sell the property?</h3>
<p>Selling the qualifying property while the Golden Visa is active would place the continued validity of the residency permit at risk if the sale price is not reinvested in qualifying Spanish real estate. Legal advice is essential before proceeding with any sale of the qualifying asset.</p>

<p style="margin-top:2rem"><strong>Interested in the Spanish Golden Visa?</strong> Our advisors specialise in guiding international investors through the entire process, from property selection to residency permit. <a href="/contacto" style="color:#b8942e;font-weight:600">Request a personalised consultation.</a></p>`,
  },

  // ─── ENGLISH 3 ─────────────────────────────────────────────────
  {
    title: 'Costa del Sol vs Costa Blanca: Where to Invest in 2026',
    slug: 'costa-del-sol-vs-costa-blanca-invest-2026',
    category: 'locations',
    language: 'en',
    read_time: 8,
    excerpt: 'A detailed comparison of Spain\'s two leading coastal investment markets: prices, rental yields, buyer profiles and growth prospects for international investors in 2026.',
    meta_description: 'Costa del Sol vs Costa Blanca for property investment in 2026: price comparison, rental yields, buyer profiles and which coast best suits your investment goals.',
    cover_image: c(IMG.spain), banner_image_url: b(IMG.spain),
    content: `<p><strong>Summary:</strong> Costa del Sol and Costa Blanca are Spain's two most active coastal markets for international buyers. The Costa del Sol commands higher asset values, a more mature luxury segment and stronger year-round rental demand. The Costa Blanca offers lower entry prices, greater market diversity and particularly strong demand from Northern European buyers seeking primary or secondary residences.</p>

<h2>Market Overview in 2026</h2>
<p>Both coasts have delivered sustained price growth over the past three years. The Costa del Sol recorded average price growth of <strong>8.4 %</strong> year-on-year in 2024 across the residential segment. The Costa Blanca grew at <strong>6.1 %</strong> in the same period, with northern municipalities such as Javea and Moraira exceeding 9 %.</p>
<p>The most significant difference lies in average transaction size and buyer profile. The Costa del Sol attracts buyers with a median investment above <strong>550,000 euros</strong>. On the Costa Blanca, the median sits around <strong>280,000 euros</strong>, with a broader range spanning from affordable seaside apartments to ultra-luxury sea-view villas.</p>

<h2>Price Comparison by Location</h2>
<ul>
<li><strong>Marbella (Costa del Sol):</strong> 5,200–9,000 €/m² in prime areas such as the Golden Mile and Sierra Blanca.</li>
<li><strong>Estepona (Costa del Sol):</strong> 3,200–5,500 €/m².</li>
<li><strong>Alicante city (Costa Blanca):</strong> 2,000–3,500 €/m².</li>
<li><strong>Javea / Altea (Northern Costa Blanca):</strong> 3,500–5,500 €/m² for sea-view villas.</li>
<li><strong>Torrevieja / Orihuela Costa (Southern Costa Blanca):</strong> 1,500–2,500 €/m².</li>
</ul>

<h2>Rental Yield Comparison</h2>
<p>Holiday rental yields on both coasts are attractive, though with meaningful differences:</p>
<ul>
<li><strong>Costa del Sol:</strong> 4.5–7 % gross annual yield on well-located properties. The high and shoulder seasons extend across 9–10 months of the year thanks to the climate.</li>
<li><strong>Costa Blanca:</strong> 4–6.5 % gross annual yield. The peak season is more concentrated in July and August, with a shorter shoulder season.</li>
</ul>
<p>A two-bedroom apartment on the Costa del Sol in a prime beachfront location can generate <strong>between 25,000 and 45,000 euros annually</strong> in gross holiday rental income. The equivalent on the Costa Blanca typically generates 12,000–20,000 euros.</p>

<h2>International Buyer Profiles</h2>
<p>The dominant buyer nationalities differ significantly between the two coasts:</p>
<ul>
<li><strong>Costa del Sol:</strong> Scandinavians, Germans, British (declining post-Brexit), Latin Americans and US buyers of Hispanic origin. The luxury segment attracts buyers from the Middle East and Russia.</li>
<li><strong>Costa Blanca:</strong> British (particularly around Torrevieja), Germans, Belgians, Dutch and Scandinavians. The Northern Costa Blanca attracts a more affluent European buyer.</li>
</ul>

<h2>Infrastructure and Quality of Life</h2>
<p>Both coasts offer international airports with direct connections to major European and American cities. Malaga Airport handles over <strong>23 million passengers annually</strong>. Alicante-Elche Airport handles over <strong>16 million</strong>. The Costa del Sol has a superior concentration of luxury amenities: over 70 golf courses, world-class marinas, international schools and high-end medical facilities.</p>

<h2>Which Coast for Which Investor?</h2>
<ul>
<li><strong>Capital appreciation focus:</strong> Costa del Sol, particularly Marbella and Benahavis, where land scarcity and sustained demand support strong long-term price growth.</li>
<li><strong>Rental yield with lower entry point:</strong> Northern Costa Blanca (Javea, Altea) or Estepona on the Costa del Sol.</li>
<li><strong>Holiday home with excellent quality of life:</strong> both coasts are exceptional. The choice ultimately comes down to personal lifestyle preferences.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Which coast has better long-term price growth prospects?</h3>
<p>Marbella and the New Golden Mile (between Marbella and Estepona) consistently rank highest for long-term capital appreciation, driven by constrained land supply and sustained demand from high-net-worth international buyers.</p>

<h3>Is it easier to obtain a holiday rental licence on the Costa Blanca or Costa del Sol?</h3>
<p>The Valencian Community (Costa Blanca) has a relatively straightforward tourist property registration process. In Andalusia (Costa del Sol), the regional register exists but some municipalities apply additional local regulations.</p>

<h3>Which coast has better international school options?</h3>
<p>The Costa del Sol has a significantly wider choice of international schools, with well-established British, American, German and Scandinavian curricula available within the Marbella-Estepona-Sotogrande corridor.</p>

<h3>Are there tax differences between buying in Andalusia versus Valencia?</h3>
<p>Yes. Transfer Tax (ITP) on resale properties in Andalusia is 7 %. In the Valencian Community it is 10 %. For new-build properties, VAT is 10 % in both regions, though stamp duty varies slightly.</p>

<p style="margin-top:2rem"><strong>Our specialists cover both coasts.</strong> Whether you are drawn to the prestige of Marbella or the value proposition of the Costa Blanca, we can match you with the right property. <a href="/propiedades" style="color:#b8942e;font-weight:600">Browse available properties.</a></p>`,
  },

  // ─── ENGLISH 4 ─────────────────────────────────────────────────
  {
    title: 'How to Buy a Villa in Marbella: Insider Guide for International Buyers',
    slug: 'buy-villa-marbella-international-buyers',
    category: 'locations',
    language: 'en',
    read_time: 8,
    excerpt: 'Marbella\'s villa market offers some of Europe\'s finest luxury real estate. This guide covers the top neighbourhoods, realistic 2026 prices and the key steps to buying with confidence.',
    meta_description: 'How to buy a villa in Marbella in 2026: top neighbourhoods, price per square metre, La Zagaleta, Golden Mile, Sierra Blanca. Guide for international buyers.',
    cover_image: c(IMG.villa), banner_image_url: b(IMG.villa),
    content: `<p><strong>Summary:</strong> Marbella is Spain's premier luxury real estate market and one of Europe's most dynamic high-end villa markets. Prices range from <strong>2 million to over 20 million euros</strong>, with trophy properties in La Zagaleta exceeding 30 million. Structural land scarcity in prime areas and sustained international demand have driven prices up <strong>9.2 %</strong> in 2024 alone, with further growth expected through 2026.</p>

<h2>Why Marbella Remains Europe's Top Luxury Villa Destination</h2>
<p>Marbella combines more than <strong>320 days of sunshine per year</strong>, first-class infrastructure, award-winning gastronomy, 70-plus golf courses across the province, and 45-minute access to Malaga International Airport. This combination creates a lifestyle proposition that few European destinations can match, consistently attracting ultra-high-net-worth buyers from across the globe.</p>

<h2>Top Neighbourhoods for Villa Buyers</h2>

<h2>La Zagaleta</h2>
<p>Spain's most exclusive private residential estate: 900 hectares of secured parkland, two championship golf courses, an equestrian club and helicopter landing pads. Villa prices range from <strong>5 million to 40 million euros</strong>. Residents are predominantly from the Middle East, Russia, the Gulf states and US technology and finance.</p>

<h2>Sierra Blanca and Nagüeles</h2>
<p>Elevated position on the hillside above Marbella with panoramic Mediterranean and Gibraltar views. Villas priced from 3 to 15 million euros. High demand from Scandinavian, Swiss and Benelux buyers seeking privacy combined with proximity to central Marbella.</p>

<h2>Golden Mile (Marbella Club to Puerto Banus)</h2>
<p>The historic heart of Marbella luxury, running 6 kilometres between the Marbella Club and Puerto Banus. Beachfront villas and elevated properties with direct sea views. Price range: 2 to 12 million euros. Strong demand from Arab, Latin American and Russian buyers.</p>

<h2>Nueva Andalucia — Valley of the Golf Courses</h2>
<p>Surrounded by five championship golf courses including Las Brisas and Aloha. Villas priced from 800,000 to 4 million euros, making this the most accessible entry point for the Marbella villa market. Equally popular as a primary residence and investment property.</p>

<h2>Realistic Price Guide Per Square Metre (2026)</h2>
<ul>
<li>La Zagaleta: <strong>8,000–15,000 €/m²</strong> of built area.</li>
<li>Sierra Blanca / Golden Mile: <strong>6,000–11,000 €/m²</strong>.</li>
<li>Nueva Andalucia: <strong>4,000–7,500 €/m²</strong>.</li>
<li>Benahavis (neighbouring municipality): <strong>3,500–7,000 €/m²</strong> with larger plots.</li>
<li>Estepona (adjacent): <strong>3,200–5,500 €/m²</strong>.</li>
</ul>

<h2>Critical Due Diligence Points for Villa Buyers</h2>
<p>The Marbella market has a specific history of planning irregularities. Before proceeding with any purchase, your lawyer must verify:</p>
<ul>
<li>The <strong>First Occupancy Licence</strong> (Licencia de Primera Ocupación) or an equivalent certificate confirming legal habitation.</li>
<li>Compliance of the built footprint with the granted building licence (illegal extensions are common in older properties).</li>
<li>Full Land Registry check for outstanding charges, mortgages and any easements.</li>
<li>Urban planning classification of the plot (particularly relevant in rural areas bordering golf courses).</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>What is the minimum price for a villa in Marbella?</h3>
<p>Entry-level detached villas in secondary locations can be found from approximately 800,000 euros. In prime areas such as the Golden Mile and Sierra Blanca, a quality villa typically starts from 2 million euros.</p>

<h3>Is Benahavis a good alternative to Marbella?</h3>
<p>Benahavis offers larger plots, greater privacy and slightly lower prices than equivalent Marbella locations. It is particularly well-suited to buyers prioritising extensive landscaped gardens and full privacy over proximity to the beach and amenities. The municipality has maintained strict planning controls, preserving its exclusive character.</p>

<h3>What is the negotiation margin in the Marbella villa market?</h3>
<p>In the current market, the negotiation margin on listed properties is typically <strong>5–10 %</strong> in direct vendor-buyer transactions. For off-market properties handled exclusively through established agencies, the margin is often narrower as pricing tends to be more realistic from the outset.</p>

<h3>Are there planning risks when buying an older Marbella villa?</h3>
<p>Yes. A number of older villas in Marbella have unauthorised extensions or improvements built without the required licences. These can create legal complications in future transactions and should be identified through comprehensive due diligence before any commitment to purchase.</p>

<p style="margin-top:2rem"><strong>Looking for a villa in Marbella?</strong> We provide access to an exclusive portfolio of off-market listings in Sierra Blanca, La Zagaleta and the New Golden Mile that are not publicly advertised. <a href="/propiedades" style="color:#b8942e;font-weight:600">Request our confidential property brochure.</a></p>`,
  },

  // ─── ENGLISH 5 ─────────────────────────────────────────────────
  {
    title: 'Spain Property Tax for Non-Residents: What You Need to Know',
    slug: 'spain-property-tax-non-residents',
    category: 'guides',
    language: 'en',
    read_time: 8,
    excerpt: 'A complete guide to Spanish property taxes for non-resident owners: purchase taxes, annual obligations, rental income tax and capital gains. Updated for 2026.',
    meta_description: 'Spain property tax for non-residents 2026: transfer tax, IVA, stamp duty, IRNR, wealth tax and capital gains. Complete guide for international property owners.',
    cover_image: c(IMG.legal), banner_image_url: b(IMG.legal),
    content: `<p><strong>Summary:</strong> Non-resident property owners in Spain face two layers of taxation: purchase taxes (Transfer Tax or VAT+Stamp Duty) and ongoing annual obligations (Non-Resident Income Tax, local rates and wealth tax). Total purchase-related taxes typically represent <strong>10–14 %</strong> of the purchase price. EU/EEA residents benefit from lower annual tax rates than buyers from outside the European Economic Area.</p>

<h2>Purchase Taxes: Resale Properties</h2>
<p>When purchasing a resale property in Spain, the buyer pays the <strong>Transfer Tax (ITP)</strong>, which is levied by and varies between Spain's autonomous communities:</p>
<ul>
<li><strong>Andalusia (Costa del Sol):</strong> 7 % (reduced standard rate effective from 2021).</li>
<li><strong>Valencian Community (Costa Blanca):</strong> 10 %.</li>
<li><strong>Catalonia:</strong> 10 %.</li>
<li><strong>Madrid:</strong> 6 %.</li>
<li><strong>Balearic Islands:</strong> 8–13 % on a sliding scale based on purchase price.</li>
<li><strong>Canary Islands:</strong> 6.5 %.</li>
</ul>

<h2>Purchase Taxes: New-Build Properties</h2>
<p>New-build properties purchased from a developer are subject to a different tax regime:</p>
<ul>
<li><strong>VAT (IVA):</strong> 10 % of the purchase price for standard residential properties.</li>
<li><strong>Stamp Duty (AJD):</strong> 0.5–1.5 % depending on the autonomous community. In Andalusia, the rate is 1.2 %.</li>
</ul>

<h2>Notary and Land Registry Fees</h2>
<p>Notary fees in Spain are set by regulated tariffs. For a property valued at 500,000 euros, notary and Land Registry fees combined typically total between <strong>1,800 and 3,000 euros</strong>.</p>

<h2>The 3 % Withholding on Resale Purchases</h2>
<p>When purchasing a property from a non-resident vendor, Spanish law requires the buyer to withhold <strong>3 % of the purchase price</strong> and pay it directly to the Spanish Tax Agency (AGENCIA TRIBUTARIA) on account of the seller's Non-Resident Income Tax on the capital gain. This obligation falls on the buyer, and failure to comply can result in the buyer being held jointly liable for the seller's tax debt.</p>

<h2>Annual Tax Obligations for Non-Resident Owners</h2>
<ul>
<li><strong>Council Tax (IBI):</strong> annual municipal tax calculated as a percentage (0.4–1.3 %) of the cadastral value. Paid to the local council.</li>
<li><strong>IRNR on deemed rental income:</strong> if the property is not rented out, a deemed income of 1.1 % of the cadastral value is taxed at 19 % (EU/EEA residents) or 24 % (all others).</li>
<li><strong>IRNR on actual rental income:</strong> net rental income is taxed at 19 % for EU/EEA residents (who may deduct costs) and 24 % for others (no cost deduction permitted).</li>
</ul>

<h2>Wealth Tax</h2>
<p>Spain levies Wealth Tax on the Spanish assets held by non-residents. The individual exemption is <strong>700,000 euros</strong>. Rates range from 0.2 % to 3.5 % on net taxable wealth above the threshold, varying by autonomous community. Some regions such as Madrid have historically bonified this tax, though regional tax rules are subject to change.</p>

<h2>Capital Gains on Sale</h2>
<p>When selling a Spanish property as a non-resident, the gain is subject to Non-Resident Income Tax at <strong>19 % for EU/EEA residents</strong> and <strong>24 % for all others</strong>. The taxable gain is the difference between the acquisition price (adjusted for costs and improvements) and the sale price. Municipal Capital Gains Tax (plusvalia municipal) is also payable by the vendor.</p>

<h2>Frequently Asked Questions</h2>

<h3>Can EU residents deduct property expenses from rental income?</h3>
<p>Yes. EU and EEA residents can deduct costs directly associated with generating rental income, including mortgage interest, insurance, community fees, IBI, depreciation and repair costs. Non-EU residents are taxed on gross rental income with no deductions permitted.</p>

<h3>When is the annual IRNR declaration due?</h3>
<p>The annual Non-Resident Income Tax return (Form 210) for deemed rental income must be filed between 1 January and 31 December of the year following the tax year in question. Actual rental income must be declared quarterly.</p>

<h3>Is there inheritance tax in Spain for non-residents?</h3>
<p>Yes. Non-residents inheriting Spanish assets are subject to Spanish Inheritance Tax (ISD). Rates and exemptions vary significantly by autonomous community. Some regions such as Andalusia have introduced near-total exemptions for close relatives.</p>

<h3>What is the double taxation treaty position?</h3>
<p>Spain has double taxation treaties with most major countries, including the United States, the United Kingdom, Mexico, Colombia and many other Latin American nations. These treaties typically limit the extent to which the same income can be taxed in both countries. Consulting a tax advisor familiar with both jurisdictions is strongly recommended.</p>

<p style="margin-top:2rem"><strong>Need help navigating Spanish property taxes?</strong> Our team works alongside specialist tax advisors with deep expertise in non-resident property taxation. <a href="/contacto" style="color:#b8942e;font-weight:600">Request a tax consultation.</a></p>`,
  },

  // ─── ENGLISH 6 ─────────────────────────────────────────────────
  {
    title: 'Brexit Impact on UK Buyers in Spain: 2026 Update',
    slug: 'brexit-impact-uk-buyers-spain-2026',
    category: 'guides',
    language: 'en',
    read_time: 7,
    excerpt: 'How Brexit has changed the rules for British buyers purchasing property in Spain. Updated guide covering visa requirements, 90-day rule, tax implications and the practical path to Spanish residency in 2026.',
    meta_description: 'Brexit and buying property in Spain as a UK national in 2026: 90-day rule, residency options, tax changes and how British buyers are adapting. Complete guide.',
    cover_image: c(IMG.estepona), banner_image_url: b(IMG.estepona),
    content: `<p><strong>Summary:</strong> Since Brexit, British nationals are treated as non-EU third-country nationals in Spain. This means the <strong>90-day Schengen rule</strong> applies, limiting visa-free stays to 90 days in any 180-day period. However, British buyers can still purchase property freely in Spain, and several residency pathways remain available, including the Non-Lucrative Visa, the Golden Visa and the Digital Nomad Visa. British buyers remain one of the largest groups of foreign property purchasers in Spain.</p>

<h2>Can British Citizens Still Buy Property in Spain After Brexit?</h2>
<p>Yes. Brexit has not affected the right of British nationals to purchase property in Spain. Property ownership rights are not linked to EU membership. British buyers continue to be among the most active international purchasers on the Costa del Sol, Costa Blanca and Balearic Islands. In 2024, British nationals remained within the top 3 foreign nationalities purchasing property in Spain.</p>

<h2>The 90-Day Rule: What It Means in Practice</h2>
<p>Since 1 January 2021, British nationals can spend a maximum of <strong>90 days in any 180-day rolling period</strong> in the Schengen Area without a visa. This applies to all Schengen countries collectively, not just Spain. The 90 days can be spread across multiple trips or used consecutively, but the total cannot exceed 90 days in any 180-day window.</p>
<p>For many British holiday home owners who previously spent 3–4 months in Spain over winter, this represents a significant practical constraint. The most common solutions are:</p>
<ul>
<li>Splitting time between Spain and non-Schengen destinations (UK, Turkey, Morocco).</li>
<li>Obtaining a Spanish residency permit to remove the 90-day limitation entirely.</li>
</ul>

<h2>Residency Options for British Property Owners</h2>

<h2>Non-Lucrative Visa (NLV)</h2>
<p>The most popular route for British retirees and those with passive income. Requirements include demonstrating sufficient financial means (approximately <strong>2,400 euros per month</strong> for the main applicant plus 600 euros per dependent), comprehensive health insurance and a clean criminal record. The NLV does not permit working in Spain but allows unlimited residence. Applied for at the Spanish consulate in the UK.</p>

<h2>Golden Visa</h2>
<p>For British investors purchasing property worth <strong>500,000 euros or more</strong> free of mortgage. Provides immediate residency with no minimum stay requirement. The most flexible option for those not intending to move to Spain full-time. See our full Golden Visa guide for details.</p>

<h2>Digital Nomad Visa</h2>
<p>Introduced in 2023, this visa is available to British nationals who work remotely for non-Spanish companies. Requires proof of employment or contracts with companies outside Spain. Valid for 1 year (renewable to 5 years). Particularly suitable for British professionals in technology, finance and creative industries.</p>

<h2>Tax Implications Post-Brexit</h2>
<p>Brexit has created specific tax changes for British property owners:</p>
<ul>
<li><strong>Non-Resident Income Tax:</strong> British owners not resident in Spain are now taxed at <strong>24 %</strong> (rather than the 19 % rate applicable to EU/EEA residents) on deemed rental income and cannot deduct property costs against rental income.</li>
<li><strong>Wealth Tax:</strong> subject to the standard non-EU non-resident rules.</li>
<li><strong>The UK-Spain double taxation treaty</strong> remains in force post-Brexit, preventing double taxation on most types of income.</li>
</ul>

<h2>Practical Considerations for British Buyers in 2026</h2>
<ul>
<li>Opening a Spanish bank account is more administratively demanding for UK residents since Brexit but remains fully achievable with the right documentation.</li>
<li>Transferring money from the UK to Spain incurs no specific restrictions, though exchange rate risk (GBP/EUR) is a material consideration when budgeting for a purchase.</li>
<li>Many British buyers are now pursuing residency permits proactively, either through the NLV or Golden Visa, to maximise their ability to enjoy their Spanish property.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Can British nationals work in Spain after Brexit?</h3>
<p>Not on a visitor basis. To work in Spain, British nationals need a work permit or a visa that includes work authorisation (such as the Digital Nomad Visa). The Non-Lucrative Visa expressly excludes the right to work.</p>

<h3>Will I pay more tax as a British owner than I did before Brexit?</h3>
<p>If you are a non-resident owner and not applying for any Spanish residency, yes. The applicable IRNR rate for non-EU/EEA residents is 24 % rather than 19 %, and the ability to deduct property-related costs from rental income is no longer available.</p>

<h3>Can I get a mortgage in Spain as a British non-resident?</h3>
<p>Yes. Spanish banks continue to offer mortgages to British nationals on similar terms to other non-EU residents: typically 60–70 % of appraised value, up to 20–25 years. Some British specialist mortgage brokers also offer Spanish mortgage products denominated in euros.</p>

<h3>Is it still worth buying in Spain as a British national?</h3>
<p>For the majority of British buyers who have purchased in Spain, the benefits — climate, lifestyle, property values — outweigh the administrative adjustments required post-Brexit. The key is planning the residency aspect proactively rather than treating it as an afterthought.</p>

<p style="margin-top:2rem"><strong>Planning a Spanish property purchase as a UK national?</strong> Our advisors have guided dozens of British clients through the post-Brexit purchase process. <a href="/contacto" style="color:#b8942e;font-weight:600">Speak with a specialist.</a></p>`,
  },

  // ─── ENGLISH 7 ─────────────────────────────────────────────────
  {
    title: 'Investing in Tulum Real Estate: 2026 Market Analysis',
    slug: 'investing-tulum-real-estate-2026',
    category: 'investment',
    language: 'en',
    read_time: 8,
    excerpt: 'Tulum has become one of the Caribbean\'s highest-growth real estate markets. This analysis covers prices, rental yields, risks and the key zones for international investors in 2026.',
    meta_description: 'Investing in Tulum real estate in 2026: market analysis, price zones, rental yields, risks and how foreigners can buy in Mexico. Guide for international investors.',
    cover_image: c(IMG.tulum), banner_image_url: b(IMG.tulum),
    content: `<p><strong>Summary:</strong> Tulum has delivered some of the most impressive price appreciation of any Caribbean real estate market over the past five years, with values in established neighbourhoods rising <strong>60–120 %</strong> between 2019 and 2024. Gross rental yields from vacation rentals exceed <strong>7–12 %</strong> annually for well-managed properties. However, the market carries specific risks — including the fideicomiso land trust requirement for foreign buyers — that investors must understand and manage carefully.</p>

<h2>Why Tulum Has Emerged as a Global Investment Destination</h2>
<p>Tulum's transformation from a backpacker hub to a luxury wellness and investment destination has been driven by several converging factors: the inauguration of the Tulum International Airport in 2024, the partial opening of the Maya Train connecting the Yucatan Peninsula, the continued growth of wellness and eco-luxury tourism, and sustained demand from North American and European buyers seeking both lifestyle assets and income-generating properties.</p>
<p>In 2024, Tulum municipality received over <strong>2.1 million visitors</strong>, with average hotel occupancy exceeding 82 % in peak season. Vacation rental platforms report average occupancy of 68–78 % annually for professionally managed properties.</p>

<h2>Price Zones and Current Values</h2>
<ul>
<li><strong>Hotel Zone (beachfront):</strong> 4,500–9,000 USD/m² for luxury sea-view developments.</li>
<li><strong>Aldea Zama:</strong> Tulum's most established residential development, with prices of 2,800–5,500 USD/m².</li>
<li><strong>La Veleta / Region 15:</strong> expanding zone with strong appreciation potential, 1,800–3,500 USD/m².</li>
<li><strong>Selvatic / jungle-adjacent areas:</strong> eco-sustainable developments at 2,200–4,000 USD/m².</li>
</ul>
<p>Annual appreciation in Aldea Zama averaged <strong>15–22 %</strong> between 2019 and 2024. More peripheral zones that have been urbanised in this period saw 25–35 % annual growth.</p>

<h2>Rental Yield Analysis</h2>
<ul>
<li>Average annual occupancy for professionally managed 2-bedroom apartments: <strong>68–78 %</strong>.</li>
<li>Average nightly rate in peak season (January–March, July): 300–600 USD for a 2-bedroom unit.</li>
<li>Average nightly rate in shoulder season: 150–280 USD.</li>
<li>Estimated gross annual yield: <strong>7–12 %</strong> for well-located, professionally managed properties.</li>
</ul>

<h2>How Foreigners Can Buy Property in Mexico</h2>
<p>Foreign nationals cannot hold direct freehold title to property within 50 km of Mexico's coastline or 100 km from its borders. The standard solution is the <strong>Fideicomiso</strong>, a bank trust administered by a Mexican bank that holds the property title while granting the foreign buyer full rights of use, rental, renovation and sale. Annual fideicomiso fees are approximately 500–800 USD.</p>
<p>An alternative is purchasing through a <strong>Mexican corporation (SA de CV)</strong>, which can be appropriate for commercial or investment properties but involves additional administrative costs.</p>

<h2>Key Risks to Understand</h2>
<ul>
<li><strong>Developer risk:</strong> the boom has attracted numerous under-capitalised developers. Thorough verification of the developer's track record, building permits and use of escrow accounts is essential.</li>
<li><strong>Environmental regulation:</strong> Tulum borders the Sian Ka'an Biosphere Reserve. Strict environmental laws can limit development in adjacent areas and have resulted in demolition orders for non-compliant structures.</li>
<li><strong>Oversupply risk in lower tiers:</strong> the entry-level studio and one-bedroom segment is showing signs of oversupply in some zones, moderating yields and resale liquidity.</li>
<li><strong>Hurricane exposure:</strong> the Mexican Caribbean is subject to Atlantic hurricanes. Quality construction standards and mandatory hurricane insurance are non-negotiable requirements.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>What is the minimum investment for Tulum real estate?</h3>
<p>Pre-sale studio units in peripheral locations can be found from approximately 120,000 USD. For quality developments in established zones such as Aldea Zama, the entry point for a one-bedroom unit is typically 250,000–350,000 USD.</p>

<h3>How much can I earn from vacation rental in Tulum?</h3>
<p>A well-located 2-bedroom apartment in Aldea Zama can generate 35,000–65,000 USD in gross annual rental income with 65–75 % occupancy. Management, cleaning, platform fees and maintenance represent approximately 30–40 % of gross income.</p>

<h3>Is off-plan buying safe in Tulum?</h3>
<p>Off-plan purchases are the most common buying structure in Tulum due to the flexible payment plans developers offer during construction. Safety depends entirely on the developer's solvency and track record. Insisting on escrow accounts for buyer payments and verifying all building permits are the minimum due diligence requirements.</p>

<h3>What are the taxes on property in Mexico for foreigners?</h3>
<p>At purchase, the buyer pays approximately 5–7 % of the property value in acquisition taxes and notary fees. Annual property tax (predial) is relatively low. Rental income is subject to Mexican income tax. Capital gains on sale are also taxable, though rates and deductions can be optimised with professional tax planning.</p>

<p style="margin-top:2rem"><strong>Interested in Tulum real estate?</strong> We work with a carefully selected group of developers in Aldea Zama and La Veleta with verified track records. <a href="/propiedades" style="color:#b8942e;font-weight:600">View available Tulum properties.</a></p>`,
  },

  // ─── ENGLISH 8 ─────────────────────────────────────────────────
  {
    title: 'Holiday Rental Yields in Costa del Sol: What Investors Should Know',
    slug: 'holiday-rental-yields-costa-del-sol',
    category: 'investment',
    language: 'en',
    read_time: 7,
    excerpt: 'A data-driven analysis of holiday rental performance on the Costa del Sol: gross yields by zone, occupancy rates, revenue estimates and operating costs for 2026.',
    meta_description: 'Holiday rental yields Costa del Sol 2026: gross yields by zone, occupancy rates, nightly rates and operating costs. Data-driven analysis for property investors.',
    cover_image: c(IMG.invest), banner_image_url: b(IMG.invest),
    content: `<p><strong>Summary:</strong> The Costa del Sol delivers gross holiday rental yields of <strong>4.5–8 %</strong> annually, depending on location, property type and management quality. The province of Malaga received over <strong>14 million tourists in 2024</strong>, 65 % of whom stayed in non-hotel accommodation. A well-managed 2-bedroom apartment in Estepona or Fuengirola can generate between 22,000 and 35,000 euros in gross annual rental income.</p>

<h2>The Holiday Rental Market on the Costa del Sol</h2>
<p>The Costa del Sol is Spain's leading international tourism destination by visitor volume. The structural demand for vacation rental properties is driven by the extended high season (effectively 9–10 months of the year), the density of international flight connections to Malaga Airport and the growing preference among international visitors for private rental accommodation over hotels.</p>
<p>Airbnb and Booking.com data for the Costa del Sol consistently show average occupancy rates of <strong>65–75 %</strong> annually for properties managed by professional agencies. In peak summer months, occupancy frequently reaches 95–100 %.</p>

<h2>Gross Yield by Zone</h2>
<ul>
<li><strong>Marbella (Golden Mile, Puerto Banus):</strong> 4.5–6 % gross. High asset values moderate yield but provide stronger capital appreciation.</li>
<li><strong>Estepona / New Golden Mile:</strong> 5–7 % gross. The best balance of acquisition price and income potential in the western Costa del Sol.</li>
<li><strong>Fuengirola / Torremolinos:</strong> 5.5–8 % gross. Lower entry prices and high occupancy over 8–9 months.</li>
<li><strong>Nerja:</strong> 6–9 % gross. Limited supply and strong demand make this one of the highest-yielding areas.</li>
<li><strong>Mijas Costa / Calahonda:</strong> 5–7 % gross. Balanced acquisition costs and solid tourist demand.</li>
</ul>

<h2>Nightly Rate and Occupancy Data (2025 Actuals)</h2>
<ul>
<li>Peak season (July–August) — 2-bed apartment, good condition: <strong>180–350 euros/night</strong>.</li>
<li>Shoulder season (May–June, September–October): <strong>100–180 euros/night</strong>.</li>
<li>Low season (November–April): <strong>60–100 euros/night</strong>.</li>
<li>Average annual occupancy with professional management: <strong>65–75 %</strong>.</li>
</ul>

<h2>Revenue Estimates by Property Type</h2>
<ul>
<li><strong>Studio / 1-bed apartment, Fuengirola:</strong> 12,000–18,000 euros gross annually.</li>
<li><strong>2-bed apartment, Estepona beachfront:</strong> 22,000–35,000 euros gross annually.</li>
<li><strong>3-bed villa with pool, Marbella surroundings:</strong> 45,000–75,000 euros gross annually.</li>
<li><strong>4-bed luxury villa, prime Marbella:</strong> 80,000–150,000 euros gross annually.</li>
</ul>

<h2>Operating Cost Breakdown</h2>
<p>Gross yield is reduced by the following operational costs:</p>
<ul>
<li><strong>Property management agency commission:</strong> 20–30 % of gross revenues.</li>
<li><strong>Cleaning between stays:</strong> 60–120 euros per turnover.</li>
<li><strong>Utilities (electricity, water, internet):</strong> 150–300 euros per month.</li>
<li><strong>Community fees and IBI:</strong> 2,000–5,000 euros annually for a typical apartment.</li>
<li><strong>Maintenance reserve:</strong> 1–1.5 % of property value annually.</li>
</ul>
<p>Net yield after costs typically settles between <strong>3 % and 5 %</strong> for well-managed properties.</p>

<h2>Tourist Rental Licence Requirements in Andalusia</h2>
<p>To legally rent a property on a short-term basis in Andalusia, owners must register the property with the Regional Tourism Register (Registro de Turismo de Andalucia). The process involves submitting a responsible declaration confirming habitability standards. The registration number must be displayed on all rental platform listings. Note that many community of owners associations in Costa del Sol urbanisations have voted to prohibit holiday rentals — this must be verified before purchase.</p>

<h2>Frequently Asked Questions</h2>

<h3>What is the best zone for holiday rental returns on the Costa del Sol?</h3>
<p>Nerja and the Axarquia coast offer the highest gross yields due to constrained supply and growing demand. Estepona and the New Golden Mile offer the best combination of yield potential and capital appreciation in the western Costa del Sol.</p>

<h3>Is self-management or professional management better for non-resident owners?</h3>
<p>For non-resident investors, professional management is almost always the better choice. While the agency commission reduces gross yield by 20–30 %, professional managers typically achieve higher occupancy rates, better guest reviews and more effective property maintenance — all of which protect and enhance the investment over time.</p>

<h3>What tax do non-resident landlords pay on Spanish rental income?</h3>
<p>EU/EEA resident landlords pay 19 % on net rental income (after deductible costs). Non-EU/EEA residents pay 24 % on gross rental income with no cost deductions. A quarterly Form 210 declaration is required.</p>

<h3>Can community rules block holiday letting?</h3>
<p>Yes. Under Spanish horizontal property law, a community of owners can prohibit holiday rentals by a three-fifths majority vote. Always review the community statutes and minutes before purchasing with rental intent. This is particularly important in urbanisations where a restriction has been passed or is under discussion.</p>

<p style="margin-top:2rem"><strong>Want to calculate the rental potential of a specific property?</strong> Our investment analysts provide detailed rental feasibility studies for prospective buyers. <a href="/contacto" style="color:#b8942e;font-weight:600">Request a free rental yield analysis.</a></p>`,
  },

  // ─── ENGLISH 9 ─────────────────────────────────────────────────
  {
    title: 'Buying Property in Dubai for International Investors: 2026 Guide',
    slug: 'buying-property-dubai-international-investors',
    category: 'guides',
    language: 'en',
    read_time: 9,
    excerpt: 'Dubai has become the world\'s most international property market. Complete 2026 guide covering tax benefits, prime locations, buying process and residency visas for international investors.',
    meta_description: 'Buying property in Dubai as an international investor 2026: zero tax, top locations, purchase process, Golden Visa and rental yields. Complete guide.',
    cover_image: c(IMG.dubai), banner_image_url: b(IMG.dubai),
    content: `<p><strong>Summary:</strong> Dubai offers international investors a uniquely attractive combination: <strong>zero income tax on rental yields and capital gains</strong>, gross rental yields of 5–9 % annually, a transparent and efficient purchase process, and a residency visa tied to property investment from 205,000 USD. Dubai recorded <strong>over 180,000 property transactions</strong> in 2024, the highest level in the emirate's history.</p>

<h2>Why Dubai Leads the Global Investment Property Market</h2>
<p>Dubai has consistently ranked among the world's top cities for real estate investment volumes since 2020. Key structural advantages include: no income tax on rental income, no capital gains tax on property sales, no inheritance tax, a stable currency pegged to the US dollar, political stability under UAE federal governance, and world-class infrastructure. The emirate's real estate market is regulated by the Dubai Land Department (DLD) and the Real Estate Regulatory Agency (RERA), providing strong investor protection.</p>

<h2>Tax Framework for International Investors</h2>
<ul>
<li><strong>Rental income:</strong> 0 % tax in Dubai.</li>
<li><strong>Capital gains on sale:</strong> 0 % tax.</li>
<li><strong>Wealth tax:</strong> none.</li>
<li><strong>Inheritance tax:</strong> none on UAE assets.</li>
<li><strong>Purchase transaction fee:</strong> 4 % DLD Transfer Fee payable to the Dubai Land Department at completion.</li>
</ul>
<p>The only significant tax-equivalent cost at purchase is the <strong>4 % DLD Transfer Fee</strong>, plus agency fees (2 %) and administrative charges. Total transaction costs at purchase are approximately 6–7 % of the purchase price.</p>

<h2>Prime Investment Locations</h2>
<ul>
<li><strong>Downtown Dubai / Burj Khalifa Area:</strong> highest prestige and liquidity. Prices from 5,000–12,000 AED/m² (1,360–3,270 USD/m²). Strong short-term rental demand.</li>
<li><strong>Dubai Marina / JBR:</strong> waterfront living with high vacation rental income. 4,200–7,500 AED/m².</li>
<li><strong>Palm Jumeirah:</strong> the iconic artificial island. Villas and penthouses from 8,000–18,000 AED/m². Exceptional brand value and resale liquidity.</li>
<li><strong>Business Bay:</strong> Dubai's business district in rapid expansion. 3,800–6,500 AED/m². Strong corporate long-term rental demand.</li>
<li><strong>Dubai Hills Estate:</strong> master-planned community with golf course. 4,500–7,000 AED/m². Particularly popular with families and professionals.</li>
</ul>

<h2>Purchase Process</h2>
<ul>
<li><strong>Sign an MOU (Memorandum of Understanding):</strong> equivalent to a purchase contract. A 10 % deposit secures the property.</li>
<li><strong>Obtain a No Objection Certificate (NOC):</strong> required only for resale units when a service charge balance exists.</li>
<li><strong>DLD Transfer:</strong> the property title is registered at the Dubai Land Department. The process is immediate — no notarial deed required.</li>
<li><strong>Payment of 4 % DLD Transfer Fee</strong> and receipt of title deed (Oqood for off-plan, Title Deed for completed properties).</li>
</ul>
<p>For a completed property, the entire purchase process can be concluded in <strong>5–15 business days</strong>.</p>

<h2>Off-Plan Buying: Risks and Opportunities</h2>
<p>Off-plan purchases represent approximately 60 % of Dubai transactions. Developers offer payment plans over the construction period (typically 2–4 years), making off-plan accessible with lower initial capital. Key protections: developer funds are held in RERA-regulated escrow accounts, meaning buyer payments are released to the developer in tranches linked to construction milestones. Due diligence on the developer's financial position and track record remains essential.</p>

<h2>Residency Visas for Property Investors</h2>
<ul>
<li><strong>2-Year Property Investor Visa:</strong> for investments of 750,000 AED (≈ 205,000 USD) or more.</li>
<li><strong>10-Year Golden Visa:</strong> for investments of 2,000,000 AED (≈ 545,000 USD) or more. Renewable indefinitely. Includes spouse, children and domestic staff.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Who can buy freehold property in Dubai?</h3>
<p>Any foreign national can purchase property in freehold ownership in Dubai's Designated Freehold Areas. These include all the major investment locations — Dubai Marina, Downtown, Palm Jumeirah, Business Bay, Dubai Hills Estate and more. There are no restrictions based on nationality or residency status.</p>

<h3>What rental yields can I expect in Dubai?</h3>
<p>Gross rental yields in Dubai rank among the highest of any global tier-1 city: 6–8 % for apartments in Dubai Marina and Business Bay, 5–7 % for villas in Dubai Hills and Arabian Ranches. The combination of zero rental income tax and these yields makes the net return particularly compelling compared to European markets.</p>

<h3>Can I finance a Dubai property purchase with a mortgage?</h3>
<p>Yes. UAE banks offer mortgages to non-resident foreigners, up to 50 % of the property value for non-residents. Current mortgage rates are 4–5.5 % annually. Some buyers also use financing from banks in their home country secured against other assets.</p>

<h3>What happens to my visa if I sell the qualifying property?</h3>
<p>If the qualifying property is sold, the residency visa linked to that investment will need to be renewed on the basis of a new qualifying investment, or converted to another visa category. The visa does not automatically cancel upon sale but is linked to maintaining the qualifying investment threshold.</p>

<p style="margin-top:2rem"><strong>Considering a Dubai property investment?</strong> Our specialists provide curated access to off-market developments and established properties across Dubai's prime zones. <a href="/propiedades" style="color:#b8942e;font-weight:600">Explore Dubai property options.</a></p>`,
  },

  // ─── ENGLISH 10 ─────────────────────────────────────────────────
  {
    title: 'Why Estepona Is the New Marbella: Investment Guide 2026',
    slug: 'estepona-new-marbella-investment-guide',
    category: 'locations',
    language: 'en',
    read_time: 7,
    excerpt: 'Estepona has emerged as the Costa del Sol\'s most dynamic luxury market. Prices rose 11.3 % in 2024 and the town is attracting major developers and international buyers previously focused exclusively on Marbella.',
    meta_description: 'Why Estepona is the new Marbella for property investment in 2026: prices, best zones, rental yields and why international buyers are choosing Estepona over Marbella.',
    cover_image: c(IMG.estepona), banner_image_url: b(IMG.estepona),
    content: `<p><strong>Summary:</strong> Estepona is the fastest-growing luxury residential market on the Costa del Sol. Property prices rose <strong>11.3 % in 2024</strong>, outperforming Marbella in percentage growth terms. Limited new land for development, the arrival of major national and international developers, and strong international buyer demand have created a market with compelling fundamentals for investors entering in 2026.</p>

<h2>Estepona's Remarkable Transformation</h2>
<p>A decade ago, Estepona was considered the quieter, less glamorous neighbour to Marbella. A sustained programme of urban regeneration — including the award-winning old town restoration, the expansion of the beachfront promenade, and investment in cultural and sports infrastructure — has fundamentally repositioned Estepona as a premium destination in its own right.</p>
<p>Major international developers including Taylor Wimpey España, Aedas, Neinor Homes and several Luxembourg and Irish investment vehicles have launched flagship projects in Estepona, attracted by the combination of lower land costs than Marbella, a highly educated planning department and strong projected demand.</p>

<h2>Key Investment Zones</h2>

<h2>The New Golden Mile (Between Estepona and Marbella)</h2>
<p>The coastal corridor connecting the two municipalities, designated the New Golden Mile, is currently the most sought-after development zone on the Costa del Sol. Urbanisations including Cancelada, Seghers and Los Flamingos are home to prestige developments with sea and golf views. Prices range from <strong>3,500 to 6,500 euros per square metre</strong>, with frontline golf and sea-view properties in top developments reaching 8,000 euros/m².</p>

<h2>Estepona Old Town</h2>
<p>The fully-restored historic town centre attracts buyers seeking character properties in an authentically Spanish environment. Prices of 2,500–4,000 euros/m² are more accessible than comparable locations in Marbella. Solid long-term rental demand from professionals working in the area provides a stable income stream for investors.</p>

<h2>Atalaya / Costalita</h2>
<p>Established residential area between Estepona and San Pedro, characterised by well-maintained ground floor apartments and townhouses. Prices from 3,000–5,500 euros/m². High demand from Scandinavian and German buyers. Excellent road connections to Marbella, Gibraltar and Malaga Airport.</p>

<h2>Market Fundamentals and Growth Drivers</h2>
<p>Several structural factors support Estepona's continued price growth:</p>
<ul>
<li><strong>Land scarcity:</strong> the municipal territory has limited remaining buildable land, constraining future supply and supporting price appreciation.</li>
<li><strong>Infrastructure improvements:</strong> planned rail connections to Malaga and future high-speed rail access will improve accessibility from the airport.</li>
<li><strong>Spillover from Marbella:</strong> as Marbella prices push beyond the reach of many buyers, Estepona captures demand from those seeking comparable lifestyle at more accessible price points.</li>
<li><strong>Rental market strength:</strong> holiday rental occupancy averages <strong>72 %</strong> annually for professionally managed properties in Estepona.</li>
</ul>

<h2>Estepona vs Marbella: Value Comparison</h2>
<p>For a budget of 500,000–1,000,000 euros, Estepona consistently delivers greater built area, larger outdoor spaces and quieter surroundings than comparable Marbella properties at the same price point. For buyers prioritising prestige and proximity to Puerto Banus, Marbella remains the benchmark. For those seeking the best value proposition in the western Costa del Sol, Estepona is the clear choice in 2026.</p>

<h2>Frequently Asked Questions</h2>

<h3>Is Estepona a good investment in 2026?</h3>
<p>By most metrics, yes. Limited land supply, strong international demand, major developer investment and improving infrastructure create a positive outlook for capital appreciation. Rental yields of 5–7 % provide income while the asset appreciates.</p>

<h3>What are the best international schools near Estepona?</h3>
<p>The most established international schools within convenient driving distance are Sotogrande International School (20 minutes), Laude San Pedro International College (10 minutes), and several English-curriculum schools in the Marbella area (25 minutes). This makes Estepona particularly suitable for relocating families.</p>

<h3>How does Estepona's rental market compare to Marbella?</h3>
<p>Marbella commands higher nightly rates at the premium end of the market. However, Estepona's lower acquisition costs relative to achievable rental income frequently produce a better yield ratio. A 2-bedroom apartment generating 25,000 euros annually in Estepona often represents a better investment than a comparable Marbella property generating 30,000 euros at a 40 % higher acquisition cost.</p>

<h3>Are there good new-build options in Estepona?</h3>
<p>Yes. Estepona has one of the most active new-build pipelines on the Costa del Sol, with numerous projects under construction and in planning. Buyers who purchase off-plan from established developers can benefit from pre-completion pricing that typically sits 10–20 % below the projected market value at completion.</p>

<p style="margin-top:2rem"><strong>Interested in Estepona or the New Golden Mile?</strong> We have exclusive access to new-build developments and resale properties across Estepona's most sought-after zones. <a href="/propiedades" style="color:#b8942e;font-weight:600">View available Estepona properties.</a></p>`,
  },
]

async function run() {
  console.log(`Inserting ${posts.length} blog posts...`)

  // Check for existing slugs to avoid duplicates
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('slug')
  const existingSlugs = new Set((existing ?? []).map((p: {slug: string}) => p.slug))

  let inserted = 0, skipped = 0

  for (const post of posts) {
    if (existingSlugs.has(post.slug)) {
      console.log(`  SKIP (exists): ${post.slug}`)
      skipped++
      continue
    }

    const { error } = await supabase.from('blog_posts').insert({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.cover_image,
      banner_image_url: post.banner_image_url,
      category: post.category,
      meta_description: post.meta_description,
      language: post.language,
      published: true,
      published_at: new Date().toISOString(),
      read_time: post.read_time,
    })

    if (error) {
      console.error(`  ERROR: ${post.slug} — ${error.message}`)
    } else {
      console.log(`  OK: ${post.slug}`)
      inserted++
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`)
}

run().catch(console.error)
