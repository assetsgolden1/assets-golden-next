import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Assets Golden International',
  description: 'Información sobre el tratamiento de datos personales por Assets Golden International conforme al RGPD y la LOPDGDD.',
}

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <h1 className="font-display text-4xl font-semibold text-white">Política de Privacidad</h1>
          <p className="mt-3 text-white/50 text-xs tracking-wider">Última actualización: mayo de 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury max-w-3xl">
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">

            <section>
              <p className="text-sm">
                La presente Política de Privacidad regula el tratamiento de los datos personales que los usuarios facilitan a través de este sitio web, conforme al Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD) y la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">1. Responsable del tratamiento</h2>
              <p className="text-sm">
                <strong className="text-foreground">COVA FUMADA GROUP S.L.</strong> (en adelante, &ldquo;la empresa&rdquo; o &ldquo;Assets Golden&rdquo;) es responsable del tratamiento de los datos personales que el usuario facilite a través de este sitio web.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>Razón social: <strong className="text-foreground">COVA FUMADA GROUP S.L.</strong></li>
                <li>CIF/NIF: <strong className="text-foreground">B05380886</strong></li>
                <li>Domicilio fiscal: <strong className="text-foreground">José Agustín Goytisolo 31, L5, 08970 Sant Joan Despí (Barcelona)</strong></li>
                <li>Inscripción registral: <strong className="text-foreground">Inscrita en el Registro Mercantil de Barcelona, Tomo [TOMO_PENDIENTE: confirmar con Atilio], Folio 1, Hoja B-562057, Inscripción 2</strong></li>
                <li>Teléfono: <strong className="text-foreground">+34 611 85 30 01</strong></li>
                <li>Email de contacto general: <strong className="text-foreground">hola@assetsgolden.com</strong></li>
                <li>Email para ejercicio de derechos GDPR: <strong className="text-foreground">admin@assetsgolden.com</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">2. Datos personales que recogemos</h2>
              <p className="text-sm">Recogemos los datos personales que el usuario facilita voluntariamente a través de los formularios del sitio web, así como los datos de navegación que se generan automáticamente al acceder al sitio.</p>
              <p className="text-sm mt-3 font-medium text-foreground">Datos facilitados por el usuario:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Nombre y apellidos</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Tipo de interés (compra, venta, inversión, colaboración profesional)</li>
                <li>Mensaje, consulta o demanda de inmueble</li>
                <li>Información sobre el inmueble que el usuario desea vender (dirección, características, fotografías) cuando aplique</li>
              </ul>
              <p className="text-sm mt-3 font-medium text-foreground">Datos recogidos automáticamente:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Dirección IP y datos técnicos de conexión (navegador, sistema operativo, idioma)</li>
                <li>Páginas visitadas, fecha y hora de acceso</li>
                <li>Identificadores de cookies estrictamente necesarias (sesión, seguridad, preferencias)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">3. Finalidad del tratamiento</h2>
              <p className="text-sm">Los datos personales que el usuario facilite serán tratados con las siguientes finalidades:</p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>Atender consultas, peticiones de información y solicitudes de contacto</li>
                <li>Gestionar la relación comercial derivada de las solicitudes (compraventa, arrendamiento, asesoría)</li>
                <li>Tramitar las demandas de inmueble y la oferta de propiedades en venta</li>
                <li>Enviar comunicaciones comerciales sobre propiedades y servicios, únicamente cuando el usuario haya prestado su consentimiento expreso</li>
                <li>Garantizar la seguridad del sitio web y prevenir usos fraudulentos</li>
                <li>Cumplir con las obligaciones legales que resulten aplicables</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">4. Base jurídica del tratamiento</h2>
              <p className="text-sm">El tratamiento de los datos personales se basa en las siguientes bases jurídicas previstas en el artículo 6 del RGPD:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                <li><strong className="text-foreground">Consentimiento del interesado (art. 6.1.a RGPD):</strong> al cumplimentar y enviar los formularios del sitio, el usuario consiente expresamente el tratamiento de sus datos para las finalidades indicadas. El consentimiento puede retirarse en cualquier momento.</li>
                <li><strong className="text-foreground">Ejecución de un contrato o medidas precontractuales (art. 6.1.b RGPD):</strong> para gestionar la relación comercial cuando el usuario solicita información sobre un inmueble o un servicio con vistas a contratar.</li>
                <li><strong className="text-foreground">Interés legítimo (art. 6.1.f RGPD):</strong> para garantizar la seguridad del sitio, prevenir el fraude y mantener la trazabilidad de las comunicaciones comerciales iniciadas por el propio usuario.</li>
                <li><strong className="text-foreground">Cumplimiento de obligación legal (art. 6.1.c RGPD):</strong> para conservar la documentación contable, fiscal y mercantil exigida por la normativa aplicable.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">5. Destinatarios y encargados del tratamiento</h2>
              <p className="text-sm">
                Los datos personales podrán ser comunicados a los proveedores tecnológicos que actúan como <strong className="text-foreground">encargados del tratamiento</strong> y que resultan necesarios para la prestación del servicio. Estos proveedores ofrecen condiciones contractuales de encargo de tratamiento (Data Processing Agreements) que garantizan el cumplimiento del RGPD. Assets Golden formaliza dichos acuerdos con cada uno de ellos a través de los mecanismos habilitados en sus respectivos paneles de administración.
              </p>
              <p className="text-sm mt-3 font-medium text-foreground">Proveedores actuales:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                <li><strong className="text-foreground">Supabase</strong> (Supabase, Inc., EE.UU., con infraestructura en la UE) — base de datos, autenticación y almacenamiento de imágenes.</li>
                <li><strong className="text-foreground">Vercel</strong> (Vercel, Inc., EE.UU.) — alojamiento del sitio web y procesamiento de las peticiones HTTP.</li>
                <li><strong className="text-foreground">Cloudflare</strong> (Cloudflare, Inc., EE.UU.) — previsto para fases futuras: protección anti-bots mediante Cloudflare Turnstile en los formularios de contacto. Cuando se active, se solicitará el consentimiento expreso del usuario si fuera necesario.</li>
                <li><strong className="text-foreground">Resend</strong> (Resend, Inc., EE.UU.) — envío de correos electrónicos transaccionales.</li>
                <li><strong className="text-foreground">Google LLC</strong> (EE.UU., con infraestructura global) — almacenamiento de leads en Google Sheets a través de cuenta de servicio.</li>
                <li><strong className="text-foreground">Upstash</strong> (Upstash, Inc., EE.UU., con regiones en la UE) — almacenamiento temporal para limitación de peticiones (rate limiting).</li>
              </ul>
              <p className="text-sm mt-3">
                Adicionalmente, los datos podrán ser comunicados a las administraciones públicas, autoridades judiciales y fuerzas y cuerpos de seguridad cuando exista una obligación legal de hacerlo.
              </p>
              <p className="text-sm mt-2">
                Assets Golden no cede los datos personales a terceros con fines comerciales sin el consentimiento expreso del usuario.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">6. Transferencias internacionales de datos</h2>
              <p className="text-sm">
                Algunos de los proveedores indicados en el apartado anterior están establecidos fuera del Espacio Económico Europeo (principalmente en Estados Unidos). Estas transferencias se realizan con las garantías adecuadas previstas en el Capítulo V del RGPD:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                <li><strong className="text-foreground">EU-US Data Privacy Framework:</strong> los proveedores adheridos a este marco (verificable en <a href="https://www.dataprivacyframework.gov" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">dataprivacyframework.gov</a>) ofrecen un nivel de protección reconocido como adecuado por la Comisión Europea mediante la Decisión de adecuación de 10 de julio de 2023.</li>
                <li><strong className="text-foreground">Cláusulas Contractuales Tipo (SCCs):</strong> para los proveedores no adheridos al EU-US DPF, las transferencias se rigen por las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea (Decisión de Ejecución (UE) 2021/914), complementadas con las medidas técnicas y organizativas necesarias.</li>
                <li><strong className="text-foreground">Localización de los datos:</strong> siempre que es técnicamente posible, los datos se procesan y almacenan en regiones de la Unión Europea.</li>
              </ul>
              <p className="text-sm mt-3">
                El usuario puede solicitar copia de las garantías aplicables escribiendo a <strong className="text-foreground">admin@assetsgolden.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">7. Plazo de conservación</h2>
              <p className="text-sm">
                Los datos personales se conservarán durante el tiempo estrictamente necesario para cumplir con la finalidad para la que fueron recabados:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li><strong className="text-foreground">Consultas no contractualizadas:</strong> hasta 24 meses desde la última interacción con el usuario.</li>
                <li><strong className="text-foreground">Relaciones contractuales:</strong> mientras dure la relación y, posteriormente, durante los plazos de prescripción legal (hasta 5 años conforme al artículo 1964 del Código Civil; 6 años según el Código de Comercio para documentación mercantil; 4 años para obligaciones tributarias).</li>
                <li><strong className="text-foreground">Comunicaciones comerciales:</strong> hasta que el usuario revoque el consentimiento.</li>
                <li><strong className="text-foreground">Datos de navegación y cookies:</strong> según los plazos indicados en la <Link href="/politica-de-cookies" className="text-gold hover:underline">Política de Cookies</Link>.</li>
              </ul>
              <p className="text-sm mt-3">
                Transcurridos los plazos indicados, los datos serán suprimidos o, en su caso, anonimizados de forma irreversible.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">8. Derechos del usuario</h2>
              <p className="text-sm mb-3">El usuario puede ejercer en cualquier momento los siguientes derechos reconocidos por el RGPD y la LOPDGDD:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong className="text-foreground">Acceso</strong> (art. 15 RGPD): conocer qué datos personales tratamos sobre el usuario.</li>
                <li><strong className="text-foreground">Rectificación</strong> (art. 16 RGPD): corregir datos inexactos o incompletos.</li>
                <li><strong className="text-foreground">Supresión</strong> (art. 17 RGPD): solicitar la eliminación de los datos cuando ya no sean necesarios.</li>
                <li><strong className="text-foreground">Oposición</strong> (art. 21 RGPD): oponerse al tratamiento de los datos por motivos relacionados con la situación particular del usuario.</li>
                <li><strong className="text-foreground">Limitación del tratamiento</strong> (art. 18 RGPD): solicitar la suspensión temporal del tratamiento.</li>
                <li><strong className="text-foreground">Portabilidad</strong> (art. 20 RGPD): recibir los datos en un formato estructurado y de uso común, o que se transmitan a otro responsable.</li>
                <li><strong className="text-foreground">Retirada del consentimiento</strong> (art. 7.3 RGPD) en cualquier momento, sin que ello afecte a la licitud del tratamiento previo.</li>
                <li><strong className="text-foreground">No ser objeto de decisiones automatizadas</strong> (art. 22 RGPD), incluida la elaboración de perfiles, con efectos jurídicos significativos.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">9. Cómo ejercer los derechos y reclamaciones</h2>
              <p className="text-sm">
                Para ejercer cualquiera de los derechos anteriores, el usuario puede dirigir una solicitud por escrito a <strong className="text-foreground">admin@assetsgolden.com</strong> indicando el derecho que desea ejercer y acompañando, en su caso, copia de su documento de identidad o documento equivalente que acredite la identidad.
              </p>
              <p className="text-sm mt-3">
                Si el usuario considera que el tratamiento de sus datos no se ajusta a la normativa, tiene derecho a presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Agencia Española de Protección de Datos (AEPD)</a>, calle Jorge Juan, 6 — 28001 Madrid.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">10. Seguridad de los datos</h2>
              <p className="text-sm">
                Assets Golden aplica las medidas técnicas y organizativas adecuadas para garantizar un nivel de seguridad apropiado al riesgo: cifrado en tránsito mediante protocolos HTTPS/TLS, control de acceso por roles, segregación de entornos, registro de actividad, copias de seguridad periódicas y almacenamiento en infraestructura certificada (Supabase: ISO 27001, SOC 2 Tipo II; Vercel: SOC 2 Tipo II).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">11. Cookies</h2>
              <p className="text-sm">
                Este sitio web utiliza cookies estrictamente necesarias para su funcionamiento y, previo consentimiento del usuario, otras cookies analíticas o publicitarias. La información detallada sobre el tipo de cookies utilizadas, su finalidad y los plazos de conservación se encuentra disponible en la <Link href="/politica-de-cookies" className="text-gold hover:underline">Política de Cookies</Link>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">12. Modificaciones de esta política</h2>
              <p className="text-sm">
                Assets Golden se reserva el derecho de actualizar esta Política de Privacidad para reflejar cambios en sus prácticas, en la legislación aplicable o en los servicios prestados. Cualquier modificación significativa será notificada mediante un aviso destacado en el sitio web. Se recomienda al usuario revisar periódicamente esta página.
              </p>
            </section>

            <section className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Versión 2.0 · Vigente desde mayo de 2026 · COVA FUMADA GROUP S.L.
              </p>
            </section>

          </div>
        </div>
      </section>
    </>
  )
}
