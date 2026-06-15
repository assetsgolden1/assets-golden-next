import { Resend } from 'resend'
import type { EmailContent } from './sequenceTemplates'

// Misma infra Resend que sendWelcomeEmail (mismo from / reply-to).
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Envía un correo de la secuencia. Devuelve true solo si Resend confirma el envío
 * (sin lanzar): el cron usa este booleano para decidir si marca seq_emailN_sent_at.
 *
 * P05: se envía SOLO texto plano (sin campo `html`) para maximizar la chance de caer
 * en Principal y no en Promociones. Resend acepta envíos con solo `text`. El link va
 * como URL completa dentro del texto; los clientes la autolinkean.
 */
export async function sendSequenceEmail(email: string, content: EmailContent): Promise<boolean> {
  if (!email) return false

  try {
    const { error } = await resend.emails.send({
      from: 'Atilio Montironi <atilio@assetsgolden.com>',
      replyTo: 'atilio@assetsgolden.com',
      to: email,
      subject: content.subject,
      text: content.text,
    })
    if (error) {
      console.error(`[sendSequenceEmail] Resend devolvió error para ${email}:`, error)
      return false
    }
    console.log(`[sendSequenceEmail] Email enviado a ${email} — "${content.subject}"`)
    return true
  } catch (err) {
    console.error(`[sendSequenceEmail] Error al enviar a ${email}:`, err)
    return false
  }
}
