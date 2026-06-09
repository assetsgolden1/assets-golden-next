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

<p>Thanks for your interest in new-build properties on the Costa del Sol.</p>

<p>At Assets Golden we don't list everything. We curate a short selection matched to what each
client is looking for, so you only see properties worth your time.</p>

<p>To put one together for you, just reply with your budget and preferred area. Prefer a quick
call instead? Reply and we'll set one up.</p>

<p>Best regards,<br>
Atilio Montironi<br>
Assets Golden - International Real Estate Consulting</p>`

  try {
    await resend.emails.send({
      from: 'Assets Golden <info@assetsgolden.com>',
      replyTo: 'atilio@assetsgolden.com',
      to: email,
      subject: 'Your curated Costa del Sol selection',
      html,
    })
    console.log(`[sendWelcomeEmail] Email enviado a ${email}`)
  } catch (err) {
    console.error(`[sendWelcomeEmail] Error al enviar a ${email}:`, err)
  }
}
