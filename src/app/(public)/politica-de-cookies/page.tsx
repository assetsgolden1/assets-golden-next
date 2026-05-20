import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Cookies — Assets Golden International',
  description: 'Información sobre el uso de cookies en el sitio web de Assets Golden International conforme al artículo 22.2 de la LSSI-CE y a la guía de cookies de la AEPD.',
  alternates: {
    canonical: '/politica-de-cookies',
  },
}

export default function PoliticaCookiesPage() {
  return (
    <>
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <h1 className="font-display text-4xl font-semibold text-white">Política de Cookies</h1>
          <p className="mt-3 text-white/50 text-xs tracking-wider">Última actualización: mayo de 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury max-w-3xl">
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">

            <section>
              <p className="text-sm">
                La presente Política de Cookies da cumplimiento al artículo 22.2 de la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE) y a la <a href="https://www.aepd.es/guias/guia-cookies.pdf" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Guía sobre el uso de cookies</a> publicada por la Agencia Española de Protección de Datos (AEPD), e informa al usuario sobre el uso de cookies y tecnologías similares en el sitio web <strong className="text-foreground">assetsgolden.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">1. ¿Qué son las cookies?</h2>
              <p className="text-sm">
                Una cookie es un fichero pequeño que un sitio web almacena en el dispositivo del usuario (ordenador, móvil, tableta) cuando éste accede al sitio. Las cookies permiten reconocer al usuario en visitas posteriores, recordar sus preferencias, mantener su sesión iniciada y, en algunos casos, recoger información estadística o publicitaria.
              </p>
              <p className="text-sm mt-3">
                Junto a las cookies, este sitio puede utilizar tecnologías similares con la misma finalidad, como el almacenamiento local del navegador (localStorage / sessionStorage). Las referencias a &ldquo;cookies&rdquo; en esta política deben entenderse extendidas a estas tecnologías.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">2. Tipos de cookies utilizadas</h2>
              <p className="text-sm">
                Conforme a la clasificación de la AEPD, las cookies pueden agruparse según diversos criterios. A continuación se detallan las cookies y tecnologías de almacenamiento utilizadas actualmente en el sitio web, así como las previstas para fases futuras.
              </p>

              <h3 className="font-display text-base text-foreground mt-6 mb-2">2.1 Cookies estrictamente necesarias (técnicas)</h3>
              <p className="text-sm">
                Permiten al usuario navegar por el sitio y utilizar sus funciones esenciales. <strong className="text-foreground">No requieren consentimiento</strong> conforme al artículo 22.2 LSSI-CE.
              </p>

              <div className="overflow-x-auto mt-3">
                <table className="w-full text-xs border border-border">
                  <thead className="bg-muted text-foreground">
                    <tr>
                      <th className="text-left p-2 border-b border-border">Cookie / tecnología</th>
                      <th className="text-left p-2 border-b border-border">Proveedor</th>
                      <th className="text-left p-2 border-b border-border">Finalidad</th>
                      <th className="text-left p-2 border-b border-border">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-b border-border align-top">sb-access-token, sb-refresh-token</td>
                      <td className="p-2 border-b border-border align-top">Supabase (propia)</td>
                      <td className="p-2 border-b border-border align-top">Mantener iniciada la sesión del usuario en el área administrativa o de portal de cliente.</td>
                      <td className="p-2 border-b border-border align-top">Sesión / hasta cierre de sesión</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-b border-border align-top">cf_chl_*, __cf_bm</td>
                      <td className="p-2 border-b border-border align-top">Cloudflare (terceros)</td>
                      <td className="p-2 border-b border-border align-top">Cuando Cloudflare Turnstile se active en los formularios, estas cookies se utilizarán para los challenges de seguridad. Actualmente no están en uso.</td>
                      <td className="p-2 border-b border-border align-top">30 minutos a 24 horas</td>
                    </tr>
                    <tr>
                      <td className="p-2 align-top">_vercel_*</td>
                      <td className="p-2 align-top">Vercel (terceros)</td>
                      <td className="p-2 align-top">Identificadores técnicos del proveedor de hosting (balanceo, despliegues progresivos).</td>
                      <td className="p-2 align-top">Sesión</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-display text-base text-foreground mt-6 mb-2">2.2 Cookies analíticas</h3>
              <p className="text-sm">
                <strong className="text-foreground">Estado actual:</strong> previstas para fases futuras. Cuando se activen, se solicitará el consentimiento previo del usuario mediante el banner de cookies.
              </p>
              <p className="text-sm mt-2">
                Finalidad prevista: medir y analizar la navegación de los usuarios para elaborar estadísticas agregadas que permitan mejorar el sitio. Proveedor previsto: <strong className="text-foreground">Google Analytics 4</strong> (Google LLC, EE.UU.) con configuración de IP anonimizada.
              </p>

              <h3 className="font-display text-base text-foreground mt-6 mb-2">2.3 Cookies publicitarias y de redes sociales</h3>
              <p className="text-sm">
                <strong className="text-foreground">Estado actual:</strong> previstas para fases futuras. Cuando se activen, se solicitará el consentimiento previo del usuario mediante el banner de cookies.
              </p>
              <p className="text-sm mt-2">
                Finalidades previstas: medición de campañas, retargeting y personalización publicitaria. Proveedores previstos: <strong className="text-foreground">Meta Pixel</strong> (Meta Platforms Ireland Ltd.) y <strong className="text-foreground">Google Ads</strong> (Google LLC, EE.UU.).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">3. Base jurídica</h2>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                <li><strong className="text-foreground">Cookies estrictamente necesarias:</strong> interés legítimo del responsable del sitio para garantizar la prestación del servicio (art. 22.2 LSSI-CE, in fine).</li>
                <li><strong className="text-foreground">Cookies analíticas, publicitarias y de redes sociales:</strong> consentimiento expreso del usuario obtenido a través del banner de cookies, conforme al artículo 22.2 LSSI-CE y a los criterios de la AEPD.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">4. Gestión y revocación del consentimiento</h2>
              <p className="text-sm">
                El usuario podrá aceptar, rechazar o configurar las cookies en el momento de su primera visita al sitio web mediante el banner de cookies. El consentimiento podrá ser <strong className="text-foreground">revocado o modificado en cualquier momento</strong> a través del enlace habilitado a tal efecto, así como mediante la configuración del propio navegador.
              </p>
              <p className="text-sm mt-3">
                Cada navegador permite gestionar las cookies almacenadas. Las instrucciones más comunes están disponibles en:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Microsoft Edge</a></li>
              </ul>
              <p className="text-sm mt-3">
                El bloqueo o eliminación de las cookies estrictamente necesarias puede afectar al correcto funcionamiento del sitio web (por ejemplo, impedir el inicio de sesión en el área administrativa).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">5. Transferencias internacionales</h2>
              <p className="text-sm">
                Algunas de las cookies utilizadas (especialmente las de proveedores como Cloudflare, Vercel, Google y Meta) pueden implicar una transferencia internacional de datos a Estados Unidos u otros países fuera del Espacio Económico Europeo. Estas transferencias se realizan con las garantías adecuadas previstas en el RGPD (EU-US Data Privacy Framework, Cláusulas Contractuales Tipo) descritas en la <Link href="/politica-de-privacidad" className="text-gold hover:underline">Política de Privacidad</Link>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">6. Plazo de conservación</h2>
              <p className="text-sm">
                Los plazos de conservación de cada cookie figuran en las tablas del apartado 2. En todo caso, las cookies cuyo consentimiento haya sido revocado se eliminarán o dejarán de utilizarse a partir del momento de la revocación. La AEPD recomienda que el consentimiento prestado por el usuario sea renovado al menos cada 24 meses.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">7. Modificaciones</h2>
              <p className="text-sm">
                Esta Política de Cookies podrá ser actualizada para reflejar cambios en las cookies utilizadas, en la legislación aplicable o en las recomendaciones de la AEPD. Cualquier modificación significativa será notificada mediante un aviso destacado en el sitio web y, en su caso, requerirá la renovación del consentimiento del usuario.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">8. Más información</h2>
              <p className="text-sm">
                Para cualquier consulta sobre el uso de cookies en este sitio web, el usuario puede dirigirse a <strong className="text-foreground">admin@assetsgolden.com</strong>.
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
