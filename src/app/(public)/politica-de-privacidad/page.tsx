import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Assets Golden International',
  description: 'Información sobre el tratamiento de datos personales por Assets Golden International conforme al RGPD.',
}

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <h1 className="font-display text-4xl font-semibold text-white">Política de Privacidad</h1>
          <p className="mt-3 text-white/50 text-xs tracking-wider">Última actualización: abril 2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury max-w-3xl">
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-8">

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">1. Responsable del tratamiento</h2>
              <p>
                <strong className="text-foreground">Assets Golden International</strong> (en adelante, &ldquo;la empresa&rdquo;) es responsable del tratamiento de los datos personales que nos proporcione a través de este sitio web.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>Razón social: Assets Golden International</li>
                <li>Dirección: Passeig de Gràcia, Barcelona, España</li>
                <li>Email: <a href="mailto:hola@assetsgolden.com" className="text-gold hover:underline">hola@assetsgolden.com</a></li>
                <li>Teléfono: +34 611 85 30 01</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">2. Datos que recopilamos</h2>
              <p>Recopilamos los siguientes datos personales cuando utiliza nuestros formularios de contacto:</p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono (opcional)</li>
                <li>Tipo de interés (compra, venta, inversión)</li>
                <li>Mensaje o consulta</li>
                <li>Información sobre el inmueble (en formularios específicos)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">3. Finalidad del tratamiento</h2>
              <p>Los datos personales que nos proporcione serán utilizados para:</p>
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm">
                <li>Responder a sus consultas y solicitudes de información</li>
                <li>Gestionar la relación comercial derivada de sus solicitudes</li>
                <li>Enviarle información sobre propiedades y servicios de su interés (solo con consentimiento)</li>
                <li>Cumplir con las obligaciones legales aplicables</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">4. Base legal del tratamiento</h2>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                <li><strong className="text-foreground">Consentimiento:</strong> Al enviar el formulario de contacto, usted consiente el tratamiento de sus datos para las finalidades indicadas.</li>
                <li><strong className="text-foreground">Interés legítimo:</strong> Para gestionar consultas y mantener la relación comercial.</li>
                <li><strong className="text-foreground">Obligación legal:</strong> Para cumplir con las normativas aplicables.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">5. Conservación de los datos</h2>
              <p className="text-sm">
                Sus datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados. Los datos de contacto se conservarán durante un máximo de 2 años desde la última interacción, salvo obligación legal de conservarlos por más tiempo.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">6. Destinatarios de los datos</h2>
              <p className="text-sm mb-2">Sus datos podrán ser comunicados a:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Proveedores tecnológicos necesarios para la prestación del servicio (Supabase para base de datos, Resend para email)</li>
                <li>Administraciones públicas cuando así lo exija la ley</li>
              </ul>
              <p className="text-sm mt-2">
                No cedemos sus datos a terceros con fines comerciales sin su consentimiento expreso. Los proveedores tecnológicos actúan como encargados del tratamiento bajo acuerdos que garantizan el cumplimiento del RGPD.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">7. Sus derechos (ARCO)</h2>
              <p className="text-sm mb-3">En cualquier momento puede ejercer sus derechos de:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong className="text-foreground">Acceso:</strong> Conocer qué datos personales tratamos sobre usted.</li>
                <li><strong className="text-foreground">Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
                <li><strong className="text-foreground">Cancelación/Supresión:</strong> Solicitar la eliminación de sus datos.</li>
                <li><strong className="text-foreground">Oposición:</strong> Oponerse al tratamiento de sus datos.</li>
                <li><strong className="text-foreground">Portabilidad:</strong> Recibir sus datos en formato estructurado.</li>
                <li><strong className="text-foreground">Limitación:</strong> Solicitar la limitación del tratamiento.</li>
              </ul>
              <p className="text-sm mt-3">
                Para ejercer estos derechos, contacte con nosotros en{' '}
                <a href="mailto:hola@assetsgolden.com" className="text-gold hover:underline">hola@assetsgolden.com</a>.
                También puede presentar una reclamación ante la{' '}
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                  Agencia Española de Protección de Datos (AEPD)
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">8. Seguridad de los datos</h2>
              <p className="text-sm">
                Aplicamos medidas técnicas y organizativas adecuadas para garantizar un nivel de seguridad apropiado al riesgo: cifrado en tránsito (HTTPS/TLS), control de acceso por roles, almacenamiento en infraestructura certificada (Supabase — ISO 27001, SOC 2 Type II).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">9. Cookies</h2>
              <p className="text-sm mb-2">Este sitio web utiliza los siguientes tipos de cookies:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong className="text-foreground">Cookies necesarias:</strong> Imprescindibles para el funcionamiento del sitio (sesión, preferencias de idioma).</li>
                <li><strong className="text-foreground">Cookies analíticas:</strong> Nos permiten conocer cómo los usuarios interactúan con el sitio para mejorarlo.</li>
              </ul>
              <p className="text-sm mt-2">
                Puede gestionar sus preferencias de cookies a través del banner que aparece en su primera visita o desde la configuración de su navegador.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">10. Cambios en esta política</h2>
              <p className="text-sm">
                Nos reservamos el derecho de actualizar esta política de privacidad para reflejar cambios en nuestras prácticas o en la legislación aplicable. Le notificaremos cualquier cambio significativo a través de un aviso destacado en nuestro sitio web.
              </p>
            </section>

            <section className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Versión 1.0 · Vigente desde abril de 2026 · Assets Golden International
              </p>
            </section>

          </div>
        </div>
      </section>
    </>
  )
}
