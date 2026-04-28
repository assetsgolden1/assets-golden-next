import type { Property } from '@/types'
import type { Agent } from '@/types/agent'
import { translatePropertyType } from '@/lib/propertyTypes'
import { toSentenceCase } from '@/lib/utils/normalizeText'

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return 'Precio a consultar'
  const n = price.toLocaleString('es-ES')
  if (currency === 'USD') return `$${n}`
  if (currency === 'GBP') return `£${n}`
  return `${n} €`
}

function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Convierte texto plano con saltos de línea en párrafos HTML
function toParagraphs(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => `<p>${esc(block.replace(/\n/g, ' '))}</p>`)
    .join('')
}

const SHARED_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff; }

  .page {
    width: 210mm;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  /* Header */
  .header {
    padding: 12mm 18mm 8mm;
    border-bottom: 2.5px solid #c9a86b;
    display: flex;
    align-items: flex-end;
    gap: 10mm;
  }
  .header-logo { max-height: 16mm; max-width: 60mm; object-fit: contain; }
  .header-agency {
    font-size: 9pt; color: #888;
    letter-spacing: 1.5px; text-transform: uppercase;
    line-height: 1; padding-bottom: 1mm;
  }

  /* Photos */
  .photo-main { padding: 7mm 18mm 0; }
  .photo-main img {
    width: 100%; height: 88mm;
    object-fit: cover; border-radius: 3mm; display: block;
  }
  .no-photo {
    width: 100%; height: 40mm; background: #0a1f3d;
    border-radius: 3mm; display: flex;
    align-items: center; justify-content: center;
    color: rgba(201,168,107,0.4); font-size: 20pt; letter-spacing: 3px;
  }
  .photos-grid {
    padding: 3mm 18mm 0;
    display: flex;
    gap: 4mm;
  }
  .photos-grid img {
    flex: 1; height: 46mm;
    object-fit: cover; border-radius: 2mm; display: block;
  }
  .photos-grid-placeholder { flex: 1; }

  /* Info */
  .info { padding: 5mm 18mm 4mm; flex: 1; }
  .prop-type {
    font-size: 8.5pt; color: #c9a86b;
    text-transform: uppercase; letter-spacing: 2px;
    font-weight: 700; margin-bottom: 2mm;
  }
  .prop-title {
    font-size: 17pt; font-weight: 700;
    color: #0a1f3d; line-height: 1.2; margin-bottom: 2mm;
  }
  .prop-location { font-size: 10pt; color: #777; margin-bottom: 5mm; }

  /* Price bar */
  .price-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4mm 0;
    border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0;
  }
  .price { font-size: 20pt; font-weight: 700; color: #c9a86b; white-space: nowrap; }
  .specs { display: flex; gap: 5mm; }
  .spec { display: flex; flex-direction: column; align-items: center; gap: 0.5mm; }
  .spec-val { font-size: 12pt; font-weight: 700; color: #0a1f3d; }
  .spec-lbl { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.5px; color: #999; }

  /* Description (página 2) */
  .desc-section { padding: 7mm 18mm; flex: 1; }
  .desc-section h2 {
    font-size: 14pt; font-weight: 700; color: #0a1f3d;
    margin-bottom: 5mm; padding-bottom: 3mm;
    border-bottom: 1.5px solid #c9a86b;
  }
  .description { font-size: 9.5pt; line-height: 1.7; color: #555; }
  .description p { margin-bottom: 3mm; text-align: justify; }
  .description p:last-child { margin-bottom: 0; }

  /* Agent */
  .agent {
    padding: 5mm 18mm;
    background: #f7f5f0;
    border-top: 1px solid #e0e0e0;
  }
  .agent-name   { font-size: 11pt; font-weight: 700; color: #0a1f3d; margin-bottom: 1.5mm; }
  .agent-row    { display: flex; gap: 8mm; font-size: 9pt; color: #555; margin-bottom: 1mm; }
  .agent-agency { font-size: 8.5pt; color: #999; text-transform: uppercase; letter-spacing: 1px; }

  /* Footer */
  .footer {
    padding: 4mm 18mm; background: #0a1f3d;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-powered { font-size: 8pt; color: #c9a86b; text-transform: uppercase; letter-spacing: 1.5px; }
  .footer-ref { font-family: 'Courier New', monospace; font-size: 8pt; color: #5a6e8a; letter-spacing: 1px; }
`

export function generatePropertyPdfHtml(
  property: Property,
  agent: Agent | null,
  siteOrigin: string,
): string {
  const refCode = property.ref_code ?? (property.external_id ?? property.id.slice(0, 8)).toUpperCase()
  const propType = translatePropertyType(property.property_type)
  const title = toSentenceCase(property.title ?? '')
  const location = [property.location, property.province, property.country].filter(Boolean).join(', ')
  const description = (property.description ?? '').trim()

  const logoUrl = agent?.logo_url ?? `${siteOrigin}/logo.png`
  const logoAlt = esc(agent?.agency_name ?? agent?.full_name ?? 'Assets Golden')
  const agentName   = esc(agent?.full_name   ?? '')
  const agentPhone  = esc(agent?.phone       ?? '')
  const agentEmail  = esc(agent?.email       ?? '')
  const agentAgency = esc(agent?.agency_name ?? '')

  // Galería: foto principal + máximo 2 fotos secundarias distintas
  const mainImage = property.image_url ?? ''
  const gallery = (property.gallery_urls ?? []) as string[]
  const secondaryImages = gallery
    .filter(url => url && url !== mainImage)
    .slice(0, 2)

  const header = `
    <div class="header">
      <img class="header-logo" src="${esc(logoUrl)}" alt="${logoAlt}" />
      ${agentAgency ? `<span class="header-agency">${agentAgency}</span>` : ''}
    </div>`

  const agentBlock = `
    <div class="agent">
      ${agentName   ? `<div class="agent-name">${agentName}</div>` : ''}
      <div class="agent-row">
        ${agentPhone ? `<span>&#128222; ${agentPhone}</span>` : ''}
        ${agentEmail ? `<span>&#9993; ${agentEmail}</span>` : ''}
      </div>
      ${agentAgency ? `<div class="agent-agency">${agentAgency}</div>` : ''}
    </div>`

  const footerBlock = `
    <div class="footer">
      <span class="footer-powered">Powered by Assets Golden</span>
      <span class="footer-ref">REF: ${esc(refCode)}</span>
    </div>`

  // Página 1: fotos + datos + precio
  const page1 = `
  <div class="page">
    ${header}

    <div class="photo-main">
      ${mainImage
        ? `<img src="${esc(mainImage)}" alt="${esc(title)}" />`
        : `<div class="no-photo">ASSETS GOLDEN</div>`}
    </div>

    ${secondaryImages.length > 0 ? `
    <div class="photos-grid">
      ${secondaryImages.map(url => `<img src="${esc(url)}" alt="" />`).join('')}
      ${secondaryImages.length === 1 ? '<div class="photos-grid-placeholder"></div>' : ''}
    </div>` : ''}

    <div class="info">
      <div class="prop-type">${esc(propType)}</div>
      <div class="prop-title">${esc(title)}</div>
      ${location ? `<div class="prop-location">&#128205; ${esc(location)}</div>` : ''}
      <div class="price-bar">
        <div class="price">${esc(formatPrice(property.price, property.currency))}</div>
        <div class="specs">
          ${property.bedrooms  != null ? `<div class="spec"><span class="spec-val">${property.bedrooms}</span><span class="spec-lbl">Hab.</span></div>` : ''}
          ${property.bathrooms != null ? `<div class="spec"><span class="spec-val">${property.bathrooms}</span><span class="spec-lbl">Ba&ntilde;os</span></div>` : ''}
          ${property.area_sqm  != null ? `<div class="spec"><span class="spec-val">${property.area_sqm}</span><span class="spec-lbl">m&sup2;</span></div>` : ''}
        </div>
      </div>
    </div>

    ${agentBlock}
    ${footerBlock}
  </div>`

  // Página 2: descripción completa (solo si existe)
  const page2 = description ? `
  <div class="page">
    ${header}
    <div class="desc-section">
      <h2>Descripci&oacute;n</h2>
      <div class="description">
        ${toParagraphs(description)}
      </div>
    </div>
    ${agentBlock}
    ${footerBlock}
  </div>` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>${SHARED_CSS}</style>
</head>
<body>
${page1}
${page2}
</body>
</html>`
}
