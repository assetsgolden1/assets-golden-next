// Plantillas de la secuencia de nurture (LEADS-SEQ-P03 / estilo personal P04).
// Copy EXACTO de Downloads/LEADS-SEQ-contenido.md. Una función por correo →
// { subject, html, text }, multipart.
//
// P04: estilo "email 1:1 de Atilio", NO mailing. HTML al mínimo (solo <p> con la
// fuente por defecto del cliente), sin shell/tarjeta, sin fondo gris ni recuadro
// blanco, sin ancho fijo 600px, sin botón CTA de color (link de texto simple), sin
// colores de marca, sin fondos ni imágenes. Los datos del Email 2 van como lista
// simple, no como "números destacados" con cajas. Así cae en Principal y no en
// Promociones.

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const SIGNATURE_HTML = `<p>Best regards,<br>Atilio Montironi<br>Assets Golden | International Real Estate Consulting</p>`

const SIGNATURE_TEXT = `Best regards,
Atilio Montironi
Assets Golden | International Real Estate Consulting`

function p(html: string): string {
  return `<p>${html}</p>`
}

// Link de texto simple en una línea: "Label: <url>" con la url enlazada.
function textLink(label: string, href: string): string {
  return `${label}: <a href="${href}">${href}</a>`
}

// HTML mínimo: solo los <p> del cuerpo + la firma. Sin wrapper con estilos.
function renderHtml(parts: string[]): string {
  return [...parts, SIGNATURE_HTML].join('\n')
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
    const html = renderHtml([
      p(`Hi ${fn},`),
      p(`When you got in touch, you mentioned you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have prepared a first selection in line with that.`),
      p(`At this level the focus is on villas and penthouses with privacy and sea views, in Marbella, Benahavís and Estepona. Several are off market and not listed publicly, which is where we tend to add the most value.`),
      p(textLink('View your selection', link)),
      p(`If you would like, I can prepare a more tailored shortlist around your priorities.`),
    ])
    const text = `Hi ${firstName},

When you got in touch, you mentioned you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have prepared a first selection in line with that.

At this level the focus is on villas and penthouses with privacy and sea views, in Marbella, Benahavís and Estepona. Several are off market and not listed publicly, which is where we tend to add the most value.

View your selection: ${link}

If you would like, I can prepare a more tailored shortlist around your priorities.

${SIGNATURE_TEXT}`
    return { subject, html, text }
  }

  // Segmento A
  const subject = `${firstName}, your Costa del Sol shortlist`
  const html = renderHtml([
    p(`Hi ${fn},`),
    p(`When you got in touch, you mentioned you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have pulled together a first selection that fits.`),
    p(`You will find new build apartments and townhouses, many ready to move in or close to completion, in established coastal areas like Estepona, Fuengirola and Mijas.`),
    p(textLink('View your selection', link)),
    p(`If you tell me a bit more about what matters most to you, I can narrow it down further.`),
  ])
  const text = `Hi ${firstName},

When you got in touch, you mentioned you were looking for ${propertyType} in the ${budgetRange} range along the Costa del Sol. I have pulled together a first selection that fits.

You will find new build apartments and townhouses, many ready to move in or close to completion, in established coastal areas like Estepona, Fuengirola and Mijas.

View your selection: ${link}

If you tell me a bit more about what matters most to you, I can narrow it down further.

${SIGNATURE_TEXT}`
  return { subject, html, text }
}

// ── Email 2 — día 8 — cuerpo común + bloque por purpose + datos ──────────────
// Datos como lista simple (no cajas/colores).
const STATS_LINES = [
  '1 in 3 buyers in Málaga are international',
  '~13% price growth in 2025',
  'Off-market access through Assets Golden',
]

const PURPOSE_BLOCK_TEXT = {
  investment: `If you are buying with returns in mind: asking prices in Málaga province rose close to 13% over 2025 (INE / Idealista), with double digit growth confirmed in Marbella, Estepona and Benahavís (Tinsa), while Spain's average gross rental yield sits near 5.6% (Global Property Guide). Income and appreciation, in a supply constrained market.`,
  second_home: `If this is about a place to enjoy: you would be among a genuinely international community, with services, schools and connectivity built around it. Málaga airport keeps the coast within a short flight of most of Europe, which is a big part of the appeal for lifestyle buyers.`,
  neutral: `Whether this is a home to enjoy or a long term asset, the fundamentals point the same way: a mature, international market with a limited supply of quality new build, and the kind of off market access that makes the difference at this level.`,
} as const

function email2(lead: SequenceLead): EmailContent {
  const firstName = firstNameFrom(lead.nombre)
  const fn = escapeHtml(firstName)
  const block = derivePurposeBlock(lead.purpose)
  const purposeText = PURPOSE_BLOCK_TEXT[block]

  const subject = `${firstName}, what makes the Costa del Sol a solid place to buy`
  const html = renderHtml([
    p(`Hi ${fn},`),
    p(`A quick word on the market itself, so your decision rests on facts rather than impressions.`),
    p(`The Costa del Sol is one of Europe's most established international markets. In the province of Málaga, about one in three home purchases is made by a foreign buyer (Spanish Property Registrars, 2025), with buyers from the UK, Germany, the Netherlands, Scandinavia and the US. That depth of international demand is what keeps the market liquid and resilient, not dependent on any single country.`),
    p(`Quality new build is genuinely scarce here. Limited coastal land and slow permitting mean the best projects move quietly, often before they reach the open market. That is precisely where we work: much of what we place with clients is off market.`),
    `<ul>\n${STATS_LINES.map((s) => `<li>${s}</li>`).join('\n')}\n</ul>`,
    p(purposeText),
    p(`Whenever you want, I can show you how this plays out in the area you are considering.`),
  ])
  const text = `Hi ${firstName},

A quick word on the market itself, so your decision rests on facts rather than impressions.

The Costa del Sol is one of Europe's most established international markets. In the province of Málaga, about one in three home purchases is made by a foreign buyer (Spanish Property Registrars, 2025), with buyers from the UK, Germany, the Netherlands, Scandinavia and the US. That depth of international demand is what keeps the market liquid and resilient, not dependent on any single country.

Quality new build is genuinely scarce here. Limited coastal land and slow permitting mean the best projects move quietly, often before they reach the open market. That is precisely where we work: much of what we place with clients is off market.

${STATS_LINES.map((s) => `- ${s}`).join('\n')}

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
  const html = renderHtml([
    p(`Hi ${fn},`),
    p(`What holds most international buyers back is not choosing the property, it is how to buy safely from another country. Here is how it works in Spain, in plain terms.`),
    p(`<strong>The essentials.</strong> You need a Spanish tax number (NIE) and a local bank account. Both are straightforward and we guide you through them. We also recommend you appoint your own independent lawyer for due diligence, yours and not ours, so your interests are fully protected.`),
    p(`<strong>New build is well protected by law.</strong> The payments you make during construction are covered by a mandatory bank guarantee, and every new home carries a ten year structural warranty and a first occupation license before keys change hands. Your money is protected even if a project runs into difficulty.`),
    p(`<strong>Costs are known upfront.</strong> On a new build you pay 10% VAT and stamp duty (around 1.2% in Málaga), plus notary, registry and legal fees, landing total acquisition costs around 10 to 12% of the price. We lay them all out before you commit to anything.`),
    p(`The purchase is signed before a public notary and registered in your name, which is what makes ownership here secure. None of this is something you handle alone. Reply whenever you want and I will walk you through it for your case.`),
  ])
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
  const html = renderHtml([
    p(`Hi ${fn},`),
    p(`We have shared a fair amount these past couple of weeks. The most useful next step is usually a short conversation.`),
    p(`Based on what you told us, ${propertyType} in the ${budgetRange} range, I can prepare a tailored shortlist for you: a handful of properties that genuinely fit, including off market options you will not find on the portals.`),
    p(`If that sounds useful, just reply to this email and I will get started. No pressure and no obligation, simply a clearer picture of what is available for you.`),
  ])
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
  const html = renderHtml([
    p(`Hi ${fn},`),
    p(`It has been a little while, so I wanted to check in.`),
    p(`The Costa del Sol market has carried its momentum into 2026, and new build keeps coming to the coast. A few properties have come up in the ${budgetRange} range since we last spoke.`),
    p(`If you are still considering a move, I would be glad to send you an updated selection. And if your plans have changed or paused for now, just let me know, no problem at all.`),
    p(textLink('See what is new in your range', link)),
    p(`Whenever the timing is right, I am here.`),
  ])
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
