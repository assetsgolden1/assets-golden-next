import type { Metadata } from 'next'
import Link from 'next/link'
import { buildSpanishOnlyAlternates } from '@/lib/utils/seoAlternates'

export function generateMetadata(): Metadata {
  return {
  title: 'Aviso Legal',
  description: 'Información legal del prestador de servicios y condiciones de uso del sitio web de Assets Golden International conforme a la LSSI-CE.',
  alternates: buildSpanishOnlyAlternates('/aviso-legal'),
  openGraph: { url: '/aviso-legal' },
}
}

export default function AvisoLegalPage() {
  return (
    <>
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <h1 className="font-display text-4xl font-semibold text-white">Aviso Legal</h1>
          <p className="mt-3 text-white/50 text-xs tracking-wider">Última actualización: mayo de 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury max-w-3xl">
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">

            <section>
              <p className="text-sm">
                El presente Aviso Legal regula el acceso, navegación y uso del sitio web <strong className="text-foreground">assetsgolden.com</strong> (en adelante, &ldquo;el sitio web&rdquo;) y da cumplimiento a las obligaciones de información establecidas en la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">1. Identificación del prestador de servicios</h2>
              <p className="text-sm">
                En cumplimiento del artículo 10 de la LSSI-CE, se informa al usuario de los siguientes datos identificativos del prestador del servicio de la sociedad de la información:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>Titular: <strong className="text-foreground">COVA FUMADA GROUP S.L.</strong></li>
                <li>CIF/NIF: <strong className="text-foreground">B05380886</strong></li>
                <li>Domicilio social: <strong className="text-foreground">José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)</strong></li>
                <li>Datos registrales: <strong className="text-foreground">Inscrita en el Registro Mercantil de Barcelona, Hoja B-562057, Inscripción 2</strong></li>
                <li>Teléfono: <strong className="text-foreground">+34 611 85 30 01</strong></li>
                <li>Email: <strong className="text-foreground">hola@assetsgolden.com</strong></li>
                <li>Actividad: intermediación inmobiliaria y servicios relacionados con la inversión en bienes inmuebles.</li>
              </ul>
              <p className="text-sm mt-3">
                Cuando la actividad esté sujeta a colegiación profesional o a requisitos administrativos específicos, el usuario podrá solicitar la información correspondiente en <strong className="text-foreground">hola@assetsgolden.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">2. Objeto y aceptación</h2>
              <p className="text-sm">
                El sitio web tiene por objeto ofrecer información sobre los servicios de intermediación inmobiliaria que presta Assets Golden, exhibir una selección de inmuebles disponibles y permitir a los usuarios contactar con la empresa.
              </p>
              <p className="text-sm mt-3">
                El acceso al sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas del presente Aviso Legal en su versión vigente en el momento del acceso. Si el usuario no está conforme con cualquiera de las condiciones aquí establecidas, deberá abstenerse de utilizar el sitio web.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">3. Condiciones de uso</h2>
              <p className="text-sm">El usuario se compromete a utilizar el sitio web y sus contenidos conforme a la ley, al presente Aviso Legal, a las buenas costumbres y al orden público. En particular, el usuario se obliga a:</p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>No utilizar el sitio web con fines o efectos ilícitos, lesivos de derechos o intereses de terceros, o que de cualquier forma puedan dañar, inutilizar o sobrecargar el sitio o impedir su normal utilización.</li>
                <li>No introducir o difundir virus informáticos, código malicioso, scripts ni cualquier otro elemento que pueda alterar el funcionamiento del sitio.</li>
                <li>No realizar accesos no autorizados a áreas restringidas, técnicas de scraping masivo, ingeniería inversa ni intentos de eludir las medidas de seguridad.</li>
                <li>Facilitar información veraz y actualizada en los formularios y abstenerse de suplantar la identidad de terceros.</li>
                <li>Respetar los derechos de propiedad intelectual e industrial del titular y de terceros.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">4. Propiedad intelectual e industrial</h2>
              <p className="text-sm">
                Todos los contenidos del sitio web, incluyendo a título enunciativo y no limitativo textos, fotografías, gráficos, logotipos, marcas, código fuente, diseño, estructura de navegación, bases de datos y cualquier otro elemento, son titularidad de <strong className="text-foreground">COVA FUMADA GROUP S.L.</strong> o de terceros que han autorizado su utilización, y están protegidos por la normativa nacional e internacional de propiedad intelectual e industrial.
              </p>
              <p className="text-sm mt-3">
                Queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra forma de explotación, total o parcial, de los contenidos del sitio web sin la autorización previa y por escrito del titular. La mera consulta del sitio no otorga ningún derecho de uso sobre los contenidos.
              </p>
              <p className="text-sm mt-3">
                Las marcas, nombres comerciales o signos distintivos de terceros que aparezcan en el sitio web son titularidad de sus respectivos propietarios.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">5. Información sobre los inmuebles</h2>
              <p className="text-sm">
                La información sobre los inmuebles publicada en el sitio web (precios, superficies, características, fotografías, ubicaciones aproximadas) tiene <strong className="text-foreground">carácter meramente informativo y orientativo</strong> y <strong className="text-foreground">no constituye una oferta contractual vinculante</strong>.
              </p>
              <p className="text-sm mt-3">
                Los datos pueden provenir de terceros (propietarios, otras agencias colaboradoras, plataformas de intercambio de inmuebles) y, aunque se realiza una verificación razonable, pueden contener errores, omisiones o quedar desactualizados. Cualquier decisión de compra, venta, arrendamiento o inversión deberá basarse en la información que se confirme por escrito y, en su caso, en la documentación oficial del inmueble (nota simple del Registro de la Propiedad, certificado de eficiencia energética, cédula de habitabilidad, etc.).
              </p>
              <p className="text-sm mt-3">
                Las imágenes son ilustrativas y pueden no reflejar exactamente el estado actual del inmueble. La superficie indicada puede corresponder a superficie útil o construida según el caso.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">6. Limitación de responsabilidad</h2>
              <p className="text-sm">
                Assets Golden no se hace responsable de los daños y perjuicios que pudieran derivarse de:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>La interrupción, suspensión, retraso o mal funcionamiento del sitio web por causas ajenas a su control.</li>
                <li>La presencia de virus o de otros elementos lesivos en los contenidos pese a las medidas técnicas adoptadas.</li>
                <li>El uso indebido o ilícito del sitio web por parte de los usuarios.</li>
                <li>La inexactitud, falta de actualización o errores en la información facilitada por terceros (propietarios, agencias colaboradoras, plataformas externas).</li>
                <li>Las decisiones de inversión, compra, venta o arrendamiento adoptadas por los usuarios basándose en la información del sitio sin la debida verificación.</li>
              </ul>
              <p className="text-sm mt-3">
                El sitio web puede contener enlaces a páginas de terceros. Assets Golden no asume responsabilidad alguna por el contenido, las políticas de privacidad ni las prácticas de dichos sitios externos.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">7. Comunicaciones electrónicas</h2>
              <p className="text-sm">
                El usuario acepta que las comunicaciones que Assets Golden le dirija como consecuencia de las solicitudes y formularios cumplimentados a través del sitio web se realicen por medios electrónicos (correo electrónico, mensajería) en la dirección facilitada por el propio usuario, conforme al artículo 21 de la LSSI-CE.
              </p>
              <p className="text-sm mt-3">
                El envío de comunicaciones comerciales por vía electrónica únicamente se realizará cuando el usuario lo haya consentido expresamente o cuando exista una relación contractual previa, en los términos del artículo 21.2 LSSI-CE. El usuario podrá oponerse a la recepción de tales comunicaciones en cualquier momento mediante notificación a <strong className="text-foreground">admin@assetsgolden.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">8. Protección de datos</h2>
              <p className="text-sm">
                El tratamiento de los datos personales facilitados por el usuario se rige por la <Link href="/politica-de-privacidad" className="text-gold hover:underline">Política de Privacidad</Link> y la <Link href="/politica-de-cookies" className="text-gold hover:underline">Política de Cookies</Link>, que forman parte integrante del presente Aviso Legal.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">9. Modificaciones</h2>
              <p className="text-sm">
                Assets Golden se reserva el derecho a modificar el presente Aviso Legal y los contenidos del sitio web en cualquier momento, sin necesidad de preaviso. Las modificaciones surtirán efecto desde su publicación en el sitio web. Se recomienda al usuario revisar esta página periódicamente.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">10. Legislación aplicable y jurisdicción</h2>
              <p className="text-sm">
                El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia que pudiera derivarse del acceso o uso del sitio web, las partes se someten, con renuncia expresa a cualquier otro fuero que pudiera corresponderles, a los Juzgados y Tribunales de <strong className="text-foreground">Barcelona</strong>, salvo en aquellos supuestos en que la normativa aplicable imponga un fuero específico (por ejemplo, en relaciones con consumidores).
              </p>
            </section>

            <section className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Versión 1.0 · Vigente desde mayo de 2026 · COVA FUMADA GROUP S.L.
              </p>
            </section>

          </div>
        </div>
      </section>
    </>
  )
}
