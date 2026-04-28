import type { Property } from '@/types'
import type { Agent } from '@/types/agent'
import { translatePropertyType } from '@/lib/propertyTypes'

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

function truncate(s: string | null | undefined, max: number): string {
  if (!s) return ''
  const clean = s.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

export function generatePropertyPdfHtml(
  property: Property,
  agent: Agent | null,
  siteOrigin: string,
): string {
  const refCode = (property.external_id ?? property.id.slice(0, 8)).toUpperCase()
  const propType = translatePropertyType(property.property_type)
  const description = truncate(property.description, 420)

  // Absolute logo URL: prefer agent logo, then fall back to Assets Golden logo
  const logoUrl = agent?.logo_url ?? `${siteOrigin}/logo.png`
  const logoAlt = esc(agent?.agency_name ?? agent?.full_name ?? 'Assets Golden')

  const agentName    = esc(agent?.full_name    ?? '')
  const agentPhone   = esc(agent?.phone        ?? '')
  const agentEmail   = esc(agent?.email        ?? '')
  const agentAgency  = esc(agent?.agency_name  ?? '')

  const title    = esc(property.title)
  const location = esc([property.location, property.province, property.country].filter(Boolean).join(', '))

  const hasPhoto = Boolean(property.image_url)

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @page { size: A4; margin: 0; }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    width: 210mm;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    background: #ffffff;
  }

  /* ── Header ── */
  .header {
    padding: 12mm 18mm 8mm;
    border-bottom: 2.5px solid #c9a86b;
    display: flex;
    align-items: flex-end;
    gap: 10mm;
  }
  .header-logo {
    max-height: 16mm;
    max-width: 60mm;
    object-fit: contain;
  }
  .header-agency {
    font-size: 9pt;
    color: #888;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    line-height: 1;
    padding-bottom: 1mm;
  }

  /* ── Photo ── */
  .photo-wrap {
    padding: 7mm 18mm 0;
  }
  .photo-wrap img {
    width: 100%;
    height: 88mm;
    object-fit: cover;
    border-radius: 3mm;
    display: block;
  }
  .no-photo {
    width: 100%;
    height: 40mm;
    background: #0a1f3d;
    border-radius: 3mm;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(201,168,107,0.4);
    font-size: 20pt;
    letter-spacing: 3px;
  }

  /* ── Info ── */
  .info {
    padding: 6mm 18mm 5mm;
    flex: 1;
  }
  .prop-type {
    font-size: 8.5pt;
    color: #c9a86b;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 700;
    margin-bottom: 2mm;
  }
  .prop-title {
    font-size: 17pt;
    font-weight: 700;
    color: #0a1f3d;
    line-height: 1.2;
    margin-bottom: 2mm;
    /* clamp to 2 lines */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .prop-location {
    font-size: 10pt;
    color: #777;
    margin-bottom: 5mm;
  }

  /* ── Price + specs bar ── */
  .price-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4mm 0;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 5mm;
  }
  .price {
    font-size: 20pt;
    font-weight: 700;
    color: #c9a86b;
    white-space: nowrap;
  }
  .specs {
    display: flex;
    gap: 5mm;
    font-size: 9.5pt;
    color: #555;
  }
  .spec {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5mm;
  }
  .spec-val {
    font-size: 12pt;
    font-weight: 700;
    color: #0a1f3d;
  }
  .spec-lbl {
    font-size: 7pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #999;
  }

  /* ── Description ── */
  .description {
    font-size: 9.5pt;
    line-height: 1.65;
    color: #555;
  }

  /* ── Agent section ── */
  .agent {
    padding: 5mm 18mm;
    background: #f7f5f0;
    border-top: 1px solid #e0e0e0;
  }
  .agent-name   { font-size: 11pt; font-weight: 700; color: #0a1f3d; margin-bottom: 1.5mm; }
  .agent-row    { display: flex; gap: 8mm; font-size: 9pt; color: #555; margin-bottom: 1mm; }
  .agent-agency { font-size: 8.5pt; color: #999; text-transform: uppercase; letter-spacing: 1px; }

  /* ── Footer ── */
  .footer {
    padding: 4mm 18mm;
    background: #0a1f3d;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-powered {
    font-size: 8pt;
    color: #c9a86b;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .footer-ref {
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    color: #5a6e8a;
    letter-spacing: 1px;
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <img class="header-logo" src="${logoUrl}" alt="${logoAlt}" />
    ${agentAgency ? `<span class="header-agency">${agentAgency}</span>` : ''}
  </div>

  <!-- Photo -->
  <div class="photo-wrap">
    ${hasPhoto
      ? `<img src="${esc(property.image_url)}" alt="${title}" />`
      : `<div class="no-photo">ASSETS GOLDEN</div>`
    }
  </div>

  <!-- Info -->
  <div class="info">
    <div class="prop-type">${esc(propType)}</div>
    <div class="prop-title">${title}</div>
    ${location ? `<div class="prop-location">&#128205; ${location}</div>` : ''}

    <div class="price-bar">
      <div class="price">${esc(formatPrice(property.price, property.currency))}</div>
      <div class="specs">
        ${property.bedrooms != null ? `
          <div class="spec">
            <span class="spec-val">${property.bedrooms}</span>
            <span class="spec-lbl">Hab.</span>
          </div>` : ''}
        ${property.bathrooms != null ? `
          <div class="spec">
            <span class="spec-val">${property.bathrooms}</span>
            <span class="spec-lbl">Ba&ntilde;os</span>
          </div>` : ''}
        ${property.area_sqm != null ? `
          <div class="spec">
            <span class="spec-val">${property.area_sqm}</span>
            <span class="spec-lbl">m&sup2;</span>
          </div>` : ''}
      </div>
    </div>

    ${description ? `<p class="description">${esc(description)}</p>` : ''}
  </div>

  <!-- Agent -->
  <div class="agent">
    ${agentName   ? `<div class="agent-name">${agentName}</div>` : ''}
    <div class="agent-row">
      ${agentPhone ? `<span>&#128222; ${agentPhone}</span>` : ''}
      ${agentEmail ? `<span>&#9993; ${agentEmail}</span>` : ''}
    </div>
    ${agentAgency ? `<div class="agent-agency">${agentAgency}</div>` : ''}
  </div>

  <!-- Footer -->
  <div class="footer">
    <span class="footer-powered">Powered by Assets Golden</span>
    <span class="footer-ref">REF: ${refCode}</span>
  </div>

</body>
</html>`
}
