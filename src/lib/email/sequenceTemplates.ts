// Plantillas de la secuencia de nurture (LEADS-SEQ-P03).
// Copy EXACTO de Downloads/LEADS-SEQ-contenido.md. Una función por correo →
// { subject, html, text }. HTML email-safe (tablas + CSS inline), multipart como el
// welcome. Sin imágenes (dominio de reputación nueva): los "números destacados" del
// Email 2 son HTML/CSS, no imágenes.

import {
  deriveSegment,
  derivePurposeBlock,
  formatBudgetRange,
  formatPropertyType,
  buildFilteredLink,
  firstNameFrom,
} from './nurtureHelpers'

export interface EmailContent {
  subject: string
  html: string
  text: string
}

export interface SequenceLead {
  nombre: string | null
  presupuesto_raw: string | null
  tipo_propiedad: string | null
  purpose: string | null
}

const GOLD = '#a8854f'
const TEXT = '#333333'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const SIGNATURE_HTML = `<p style="margin:0 0 4px;font-size:16px;line-height:1.6;color:${TEXT};">Best regards,</p>
<p style="margin:0;font-size:16px;line-height:1.6;color:${TEXT};">Atilio Montironi<br>Assets Golden | International Real Estate Consulting</p>`

const SIGNATURE_TEXT = `Best regards,
Atilio Montironi
Assets Golden | International Real Estate Consulting`

function p(html: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${TEXT};">${html}</p>`
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
<tr><td style="border-radius:4px;background:${GOLD};">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">${label}</a>
</td></tr></table>`
}

// Envoltura email-safe: outer table 100% + inner 600px centrado. Firma al pie.
function emailShell(preheader: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:6px;">
<tr><td style="padding:32px 32px 24px;font-family:Arial,Helvetica,sans-serif;">
${innerHtml}
${SIGNATURE_HTML}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Email 1 — día 3 — ramifica A/B ───────────────────────────────────────────
function email1(lead: SequenceLead): EmailContent {
  const firstName = firstNameFrom(lead.nombre)
  const fn = escapeHtml(firstName)
  const propertyType = formatPropertyType(lead.tipo_propiedad)
  const budgetRange = formatBudgetRange(lead.presupuesto_raw)
  const link = buildFilteredLink(lead.presupuesto_raw, lead.tipo_propiedad)
  const segment = deriveSegment(lead.presupuesto_raw)

  if (segment === 'B') {
    const subject = `${firstName}, a private Costa del Sol shortlist`
    const html = emailShell(
      'A first private selection in line with what you told us.',
      [
        p(`Hi ${fn},`),
        p(`A few days ago you told us you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have prepared a first selection in line with that.`),
        p(`At this level the focus is on villas and penthouses with privacy and sea views, in Marbella, Benahavís and Estepona. Several are off market and not listed publicly, which is where we tend to add the most value.`),
        ctaButton('View your selection →', link),
        p(`If you would like, I can prepare a more tailored shortlist around your priorities.`),
      ].join('\n'),
    )
    const text = `Hi ${firstName},

A few days ago you told us you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have prepared a first selection in line with that.

At this level the focus is on villas and penthouses with privacy and sea views, in Marbella, Benahavís and Estepona. Several are off market and not listed publicly, which is where we tend to add the most value.

View your selection: ${link}

If you would like, I can prepare a more tailored shortlist around your priorities.

${SIGNATURE_TEXT}`
    return { subject, html, text }
  }

  // Segmento A
  const subject = `${firstName}, your Costa del Sol shortlist`
  const html = emailShell(
    'A first selection that fits what you told us.',
    [
      p(`Hi ${fn},`),
      p(`A few days ago you told us you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have pulled together a first selection that fits.`),
      p(`You will find new build apartments and townhouses, many ready to move in or close to completion, in established coastal areas like Estepona, Fuengirola and Mijas.`),
      ctaButton('View your selection →', link),
      p(`If you tell me a bit more about what matters most to you, I can narrow it down further.`),
    ].join('\n'),
  )
  const text = `Hi ${firstName},

A few days ago you told us you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have pulled together a first selection that fits.

You will find new build apartments and townhouses, many ready to move in or close to completion, in established coastal areas like Estepona, Fuengirola and Mijas.

View your selection: ${link}

If you tell me a bit more about what matters most to you, I can narrow it down further.

${SIGNATURE_TEXT}`
  return { subject, html, text }
}

// ── Email 2 — día 8 — cuerpo común + bloque por purpose + 3 stats ────────────
const STATS: Array<{ figure: string; label: string }> = [
  { figure: '1 in 3', label: 'buyers in Málaga are international' },
  { figure: '~13%', label: 'price growth in 2025' },
  { figure: 'off-market', label: 'access through Assets Golden' },
]

function statsBlockHtml(): string {
  const cells = STATS.map(
    (s) => `<td align="center" valign="top" width="33%" style="padding:14px 8px;border:1px solid #eeeeee;">
<div style="font-size:22px;font-weight:bold;color:${GOLD};line-height:1.2;">${s.figure}</div>
<div style="font-size:13px;color:#666666;line-height:1.4;margin-top:6px;">${s.label}</div>
</td>`,
  ).join('\n')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;border-collapse:separate;border-spacing:4px;">
<tr>
${cells}
</tr>
</table>`
}

const PURPOSE_BLOCK_HTML = {
  investment: `If you are buying with returns in mind: asking prices in Málaga province rose close to 13% over 2025 (INE / Idealista), with double digit growth confirmed in Marbella, Estepona and Benahavís (Tinsa), while Spain's average gross rental yield sits near 5.6% (Global Property Guide). Income and appreciation, in a supply constrained market.`,
  second_home: `If this is about a place to enjoy: you would be among a genuinely international community, with services, schools and connectivity built around it. Málaga airport keeps the coast within a short flight of most of Europe, which is a big part of the appeal for lifestyle buyers.`,
  neutral: `Whether this is a home to enjoy or a long term asset, the fundamentals point the same way: a mature, international market with a limited supply of quality new build, and the kind of off market access that makes the difference at this level.`,
} as const

function statsBlockText(): string {
  return STATS.map((s) => `  ${s.figure} — ${s.label}`).join('\n')
}

function email2(lead: SequenceLead): EmailContent {
  const firstName = firstNameFrom(lead.nombre)
  const fn = escapeHtml(firstName)
  const block = derivePurposeBlock(lead.purpose)
  const purposeText = PURPOSE_BLOCK_HTML[block]

  const subject = `${firstName}, what makes the Costa del Sol a solid place to buy`
  const html = emailShell(
    'A quick word on the market, so your decision rests on facts.',
    [
      p(`Hi ${fn},`),
      p(`A quick word on the market itself, so your decision rests on facts rather than impressions.`),
      p(`The Costa del Sol is one of Europe's most established international markets. In the province of Málaga, about one in three home purchases is made by a foreign buyer (Spanish Property Registrars, 2025), with buyers from the UK, Germany, the Netherlands, Scandinavia and the US. That depth of international demand is what keeps the market liquid and resilient, not dependent on any single country.`),
      p(`Quality new build is genuinely scarce here. Limited coastal land and slow permitting mean the best projects move quietly, often before they reach the open market. That is precisely where we work: much of what we place with clients is off market.`),
      statsBlockHtml(),
      p(purposeText),
      p(`Whenever you want, I can show you how this plays out in the area you are considering.`),
    ].join('\n'),
  )
  const text = `Hi ${firstName},

A quick word on the market itself, so your decision rests on facts rather than impressions.

The Costa del Sol is one of Europe's most established international markets. In the province of Málaga, about one in three home purchases is made by a foreign buyer (Spanish Property Registrars, 2025), with buyers from the UK, Germany, the Netherlands, Scandinavia and the US. That depth of international demand is what keeps the market liquid and resilient, not dependent on any single country.

Quality new build is genuinely scarce here. Limited coastal land and slow permitting mean the best projects move quietly, often before they reach the open market. That is precisely where we work: much of what we place with clients is off market.

${statsBlockText()}

${purposeText}

Whenever you want, I can show you how this plays out in the area you are considering.

${SIGNATURE_TEXT}`
  return { subject, html, text }
}

// ── Email 3 — día 15 — común ─────────────────────────────────────────────────
function email3(lead: SequenceLead): EmailContent {
  const firstName = firstNameFrom(lead.nombre)
  const fn = escapeHtml(firstName)

  const subject = `${firstName}, how buying from abroad actually works`
  const html = emailShell(
    'How to buy safely from another country, in plain terms.',
    [
      p(`Hi ${fn},`),
      p(`What holds most international buyers back is not choosing the property, it is how to buy safely from another country. Here is how it works in Spain, in plain terms.`),
      p(`<strong>The essentials.</strong> You need a Spanish tax number (NIE) and a local bank account. Both are straightforward and we guide you through them. We also recommend you appoint your own independent lawyer for due diligence, yours and not ours, so your interests are fully protected.`),
      p(`<strong>New build is well protected by law.</strong> The payments you make during construction are covered by a mandatory bank guarantee, and every new home carries a ten year structural warranty and a first occupation license before keys change hands. Your money is protected even if a project runs into difficulty.`),
      p(`<strong>Costs are known upfront.</strong> On a new build you pay 10% VAT and stamp duty (around 1.2% in Málaga), plus notary, registry and legal fees, landing total acquisition costs around 10 to 12% of the price. We lay them all out before you commit to anything.`),
      p(`The purchase is signed before a public notary and registered in your name, which is what makes ownership here secure. None of this is something you handle alone. Reply whenever you want and I will walk you through it for your case.`),
    ].join('\n'),
  )
  const text = `Hi ${firstName},

What holds most international buyers back is not choosing the property, it is how to buy safely from another country. Here is how it works in Spain, in plain terms.

The essentials. You need a Spanish tax number (NIE) and a local bank account. Both are straightforward and we guide you through them. We also recommend you appoint your own independent lawyer for due diligence, yours and not ours, so your interests are fully protected.

New build is well protected by law. The payments you make during construction are covered by a mandatory bank guarantee, and every new home carries a ten year structural warranty and a first occupation license before keys change hands. Your money is protected even if a project runs into difficulty.

Costs are known upfront. On a new build you pay 10% VAT and stamp duty (around 1.2% in Málaga), plus notary, registry and legal fees, landing total acquisition costs around 10 to 12% of the price. We lay them all out before you commit to anything.

The purchase is signed before a public notary and registered in your name, which is what makes ownership here secure. None of this is something you handle alone. Reply whenever you want and I will walk you through it for your case.

${SIGNATURE_TEXT}`
  return { subject, html, text }
}

// ── Email 4 — día 22 — común ─────────────────────────────────────────────────
function email4(lead: SequenceLead): EmailContent {
  const firstName = firstNameFrom(lead.nombre)
  const fn = escapeHtml(firstName)
  const propertyType = formatPropertyType(lead.tipo_propiedad)
  const budgetRange = formatBudgetRange(lead.presupuesto_raw)

  const subject = `${firstName}, shall I put together your shortlist?`
  const html = emailShell(
    'The most useful next step is usually a short conversation.',
    [
      p(`Hi ${fn},`),
      p(`We have shared a fair amount these past couple of weeks. The most useful next step is usually a short conversation.`),
      p(`Based on what you told us, ${propertyType} in the ${budgetRange} range, I can prepare a tailored shortlist for you: a handful of properties that genuinely fit, including off market options you will not find on the portals.`),
      p(`If that sounds useful, just reply to this email and I will get started. No pressure and no obligation, simply a clearer picture of what is available for you.`),
    ].join('\n'),
  )
  const text = `Hi ${firstName},

We have shared a fair amount these past couple of weeks. The most useful next step is usually a short conversation.

Based on what you told us, ${propertyType} in the ${budgetRange} range, I can prepare a tailored shortlist for you: a handful of properties that genuinely fit, including off market options you will not find on the portals.

If that sounds useful, just reply to this email and I will get started. No pressure and no obligation, simply a clearer picture of what is available for you.

${SIGNATURE_TEXT}`
  return { subject, html, text }
}

// ── Email 5 — día 60 — común (re-engagement) ─────────────────────────────────
function email5(lead: SequenceLead): EmailContent {
  const firstName = firstNameFrom(lead.nombre)
  const fn = escapeHtml(firstName)
  const budgetRange = formatBudgetRange(lead.presupuesto_raw)
  const link = buildFilteredLink(lead.presupuesto_raw, lead.tipo_propiedad)

  const subject = `${firstName}, still looking on the Costa del Sol?`
  const html = emailShell(
    'A few properties have come up in your range since we last spoke.',
    [
      p(`Hi ${fn},`),
      p(`It has been a little while, so I wanted to check in.`),
      p(`The Costa del Sol market has carried its momentum into 2026, and new build keeps coming to the coast. A few properties have come up in the ${budgetRange} range since we last spoke.`),
      p(`If you are still considering a move, I would be glad to send you an updated selection. And if your plans have changed or paused for now, just let me know, no problem at all.`),
      ctaButton('See what is new in your range →', link),
      p(`Whenever the timing is right, I am here.`),
    ].join('\n'),
  )
  const text = `Hi ${firstName},

It has been a little while, so I wanted to check in.

The Costa del Sol market has carried its momentum into 2026, and new build keeps coming to the coast. A few properties have come up in the ${budgetRange} range since we last spoke.

If you are still considering a move, I would be glad to send you an updated selection. And if your plans have changed or paused for now, just let me know, no problem at all.

See what is new in your range: ${link}

Whenever the timing is right, I am here.

${SIGNATURE_TEXT}`
  return { subject, html, text }
}

// Mapa número de email (1..5) → builder.
export const SEQUENCE_TEMPLATES: Record<number, (lead: SequenceLead) => EmailContent> = {
  1: email1,
  2: email2,
  3: email3,
  4: email4,
  5: email5,
}
