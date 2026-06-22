import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function firstNameFrom(nombre: string): string {
  const trimmed = nombre.trim()
  if (!trimmed) return 'there'
  return trimmed.split(/\s+/)[0]
}

/**
 * Envía el correo de bienvenida. Devuelve true solo si Resend confirma el envío
 * (sin lanzar y sin error en la respuesta); false si falló.
 *
 * Se envía SOLO texto plano (sin campo `html`), igual que la secuencia, para
 * maximizar la chance de caer en Principal y no en Promociones/Junk. Los links
 * van como URL completa en su propia línea; los clientes las autolinkean.
 *
 * El catch ya NO se traga el error en silencio: loguea con el email afectado y
 * devuelve el resultado real del envío.
 */
export async function sendWelcomeEmail(email: string, nombre: string): Promise<boolean> {
  if (!email) return false

  const firstName = firstNameFrom(nombre)

  const text = `Hi ${firstName},

I'm Atilio, from Assets Golden International. We specialise in newly built apartments and villas along the Spanish coast.

You recently showed interest in a property on the Costa del Sol, so I wanted to reach out personally.

Here you can browse what we have available along the Spanish coast:

Costa del Sol:
https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&zona=costa-del-sol

Costa de la Luz:
https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&zona=costa-de-la-luz

Costa de Almería:
https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&zona=costa-de-almeria

If you tell me your budget and preferred area, I'll put together a tailored shortlist for you.

Happy to help, just reply with any questions.

Best regards,
Atilio Montironi
Assets Golden | International Real Estate Consulting`

  try {
    const { error } = await resend.emails.send({
      from: 'Atilio Montironi <atilio@assetsgolden.com>',
      replyTo: 'atilio@assetsgolden.com',
      to: email,
      subject: 'Your Costa del Sol new-build selection',
      text,
    })
    if (error) {
      console.error(`[sendWelcomeEmail] Resend devolvió error para ${email}:`, error)
      return false
    }
    console.log(`[sendWelcomeEmail] Email enviado a ${email}`)
    return true
  } catch (err) {
    console.error(`[sendWelcomeEmail] Error al enviar a ${email}:`, err)
    return false
  }
}
