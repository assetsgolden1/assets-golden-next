import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function firstNameFrom(nombre: string): string {
  const trimmed = nombre.trim()
  if (!trimmed) return 'there'
  return trimmed.split(/\s+/)[0]
}

export async function sendWelcomeEmail(email: string, nombre: string): Promise<void> {
  if (!email) return

  const firstName = firstNameFrom(nombre)

  const html = `<p>Hi ${firstName},</p>
<p>I'm Atilio, from Assets Golden International. We specialise in newly built apartments and villas along the Spanish coast.</p>
<p>You recently showed interest in a property on the Costa del Sol, so I wanted to reach out personally.</p>
<p>Here you can browse what we have available along the Spanish coast:</p>
<ul>
<li><a href="https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&amp;zona=costa-del-sol">Costa del Sol</a></li>
<li><a href="https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&amp;zona=costa-de-la-luz">Costa de la Luz</a></li>
<li><a href="https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&amp;zona=costa-de-almeria">Costa de Almería</a></li>
</ul>
<p>If you tell me your budget and preferred area, I'll put together a tailored shortlist for you.</p>
<p>Happy to help, just reply with any questions.</p>
<p>Best regards,<br>Atilio Montironi<br>Assets Golden | International Real Estate Consulting</p>`

  const text = `Hi ${firstName},

I'm Atilio, from Assets Golden International. We specialise in newly built apartments and villas along the Spanish coast.

You recently showed interest in a property on the Costa del Sol, so I wanted to reach out personally.

Here you can browse what we have available along the Spanish coast:
- Costa del Sol: https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&zona=costa-del-sol
- Costa de la Luz: https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&zona=costa-de-la-luz
- Costa de Almería: https://assetsgolden.com/en/propiedades?pais=Espa%C3%B1a&zona=costa-de-almeria

If you tell me your budget and preferred area, I'll put together a tailored shortlist for you.

Happy to help, just reply with any questions.

Best regards,
Atilio Montironi
Assets Golden | International Real Estate Consulting`

  try {
    await resend.emails.send({
      from: 'Assets Golden <info@assetsgolden.com>',
      replyTo: 'atilio@assetsgolden.com',
      to: email,
      subject: 'Your Costa del Sol new-build selection',
      html,
      text,
    })
    console.log(`[sendWelcomeEmail] Email enviado a ${email}`)
  } catch (err) {
    console.error(`[sendWelcomeEmail] Error al enviar a ${email}:`, err)
  }
}
