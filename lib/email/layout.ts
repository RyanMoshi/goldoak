import { escapeHtml } from '@/lib/email'
import type { Branding } from '@/lib/email/branding'

/**
 * One responsive, table-based HTML frame for every email: brand header,
 * content blocks, a single clear call to action, and a corporate footer.
 * Inline styles only, so it renders in Gmail, Outlook, Apple Mail and on phones.
 */

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'code'; value: string; caption?: string }
  | { type: 'details'; rows: [string, string][] }
  | { type: 'list'; items: string[] }
  | { type: 'notice'; text: string; tone?: 'info' | 'warning' }

export interface EmailContent {
  preheader: string
  heading: string
  greeting?: string
  blocks: Block[]
  cta?: { label: string; url: string }
  closing?: string
  securityNote?: string
}

export function renderEmail(brand: Branding, content: EmailContent): { html: string; text: string } {
  const e = escapeHtml
  const logo = brand.logoUrl
    ? `<img src="${e(brand.logoUrl)}" width="44" height="44" alt="${e(brand.name)}" style="display:block;width:44px;height:44px;border-radius:10px;border:0;">`
    : `<div style="width:44px;height:44px;border-radius:10px;background:${brand.accent};color:#ffffff;font:700 16px/44px Arial,Helvetica,sans-serif;text-align:center;">${e(brand.monogram)}</div>`

  const blocks = content.blocks
    .map((b) => {
      switch (b.type) {
        case 'paragraph':
          return `<p style="margin:0 0 16px;font:15px/24px Georgia,'Times New Roman',serif;color:#2b3530;">${inline(b.text)}</p>`
        case 'code':
          return `<div style="margin:8px 0 20px;padding:18px 20px;background:#f6f4ee;border:1px solid #e6e1d3;border-radius:10px;text-align:center;">
            <div style="font:700 28px/36px 'Courier New',Courier,monospace;letter-spacing:6px;color:${brand.primary};">${e(b.value)}</div>
            ${b.caption ? `<div style="margin-top:6px;font:13px/18px Arial,Helvetica,sans-serif;color:#6b7570;">${e(b.caption)}</div>` : ''}
          </div>`
        case 'details':
          return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 20px;border:1px solid #e6e1d3;border-radius:10px;border-collapse:separate;overflow:hidden;">
            ${b.rows.map(([k, v], i) => `<tr style="background:${i % 2 ? '#fbfaf7' : '#ffffff'}"><td style="padding:10px 14px;font:13px/18px Arial,Helvetica,sans-serif;color:#6b7570;width:40%;">${e(k)}</td><td style="padding:10px 14px;font:600 14px/18px Arial,Helvetica,sans-serif;color:#1d2621;">${e(v)}</td></tr>`).join('')}
          </table>`
        case 'list':
          return `<ul style="margin:0 0 16px;padding-left:20px;font:15px/24px Georgia,'Times New Roman',serif;color:#2b3530;">${b.items.map((i) => `<li style="margin:0 0 6px;">${inline(i)}</li>`).join('')}</ul>`
        case 'notice':
          return `<div style="margin:0 0 20px;padding:12px 16px;border-left:3px solid ${b.tone === 'warning' ? '#c47c1b' : brand.accent};background:${b.tone === 'warning' ? '#fdf6ea' : '#f4f7fb'};font:14px/21px Arial,Helvetica,sans-serif;color:#2b3530;border-radius:0 8px 8px 0;">${inline(b.text)}</div>`
      }
    })
    .join('\n')

  const cta = content.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="border-radius:8px;background:${brand.accent};">
        <a href="${e(content.cta.url)}" style="display:inline-block;padding:14px 26px;font:700 15px/20px Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;border-radius:8px;">${e(content.cta.label)}</a>
      </td></tr></table>
      <p style="margin:-12px 0 20px;font:12px/18px Arial,Helvetica,sans-serif;color:#8a968f;word-break:break-all;">If the button does not work, open this link: <a href="${e(content.cta.url)}" style="color:${brand.accent};">${e(content.cta.url)}</a></p>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${e(content.heading)}</title>
<style>@media (max-width:600px){.wrap{padding:12px !important}.card{border-radius:12px !important}.pad{padding:22px 18px !important}.head{padding:18px !important}}</style>
</head>
<body style="margin:0;padding:0;background:#efece4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${e(content.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#efece4;"><tr><td class="wrap" align="center" style="padding:28px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="card" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e3ded0;">
  <tr><td class="head" style="background:${brand.primary};padding:22px 28px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="52" valign="middle">${logo}</td>
      <td valign="middle" style="padding-left:12px;">
        <div style="font:700 17px/22px Georgia,'Times New Roman',serif;color:#ffffff;">${e(brand.name)}</div>
        <div style="font:700 10px/14px Arial,Helvetica,sans-serif;letter-spacing:2px;color:${brand.accent};text-transform:uppercase;">Insurance, simply handled</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="height:3px;background:${brand.accent};font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td class="pad" style="padding:32px 36px 12px;">
    <h1 style="margin:0 0 14px;font:600 24px/32px Georgia,'Times New Roman',serif;color:${brand.primary};">${e(content.heading)}</h1>
    ${content.greeting ? `<p style="margin:0 0 14px;font:15px/24px Georgia,'Times New Roman',serif;color:#2b3530;">${e(content.greeting)}</p>` : ''}
    ${blocks}
    ${cta}
    ${content.closing ? `<p style="margin:0 0 6px;font:15px/24px Georgia,'Times New Roman',serif;color:#2b3530;">${inline(content.closing)}</p>` : ''}
    <p style="margin:18px 0 0;font:15px/24px Georgia,'Times New Roman',serif;color:#2b3530;">Warm regards,<br><strong style="color:${brand.primary};">The ${e(brand.shortName)} team</strong></p>
  </td></tr>
  ${content.securityNote ? `<tr><td style="padding:0 36px 24px;" class="pad"><div style="padding:12px 14px;background:#fbfaf7;border:1px solid #e6e1d3;border-radius:8px;font:12px/18px Arial,Helvetica,sans-serif;color:#6b7570;">${inline(content.securityNote)}</div></td></tr>` : ''}
  <tr><td style="padding:20px 36px 26px;background:#fbfaf7;border-top:1px solid #ece8dc;" class="pad">
    <p style="margin:0 0 6px;font:700 13px/18px Arial,Helvetica,sans-serif;color:${brand.primary};">${e(brand.name)}</p>
    <p style="margin:0 0 4px;font:12px/18px Arial,Helvetica,sans-serif;color:#6b7570;">${[brand.supportPhone, brand.supportEmail, brand.website.replace(/^https?:\/\//, '')].filter(Boolean).map(e).join(' &nbsp;·&nbsp; ')}</p>
    ${brand.address ? `<p style="margin:0 0 4px;font:12px/18px Arial,Helvetica,sans-serif;color:#6b7570;">${e(brand.address)}</p>` : ''}
    <p style="margin:10px 0 0;font:11px/16px Arial,Helvetica,sans-serif;color:#8a968f;">${e(brand.footerNote)} Please do not share codes or passwords from our emails with anyone. ${e(brand.poweredBy)}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  const text = [
    brand.name,
    '',
    content.heading,
    content.greeting ?? '',
    '',
    ...content.blocks.map((b) => {
      switch (b.type) {
        case 'paragraph':
          return strip(b.text) + '\n'
        case 'code':
          return `${b.value}${b.caption ? ` (${b.caption})` : ''}\n`
        case 'details':
          return b.rows.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n'
        case 'list':
          return b.items.map((i) => `- ${strip(i)}`).join('\n') + '\n'
        case 'notice':
          return `${strip(b.text)}\n`
      }
    }),
    content.cta ? `${content.cta.label}: ${content.cta.url}\n` : '',
    content.closing ? strip(content.closing) : '',
    '',
    `Warm regards, the ${brand.shortName} team`,
    content.securityNote ? `\n${strip(content.securityNote)}` : '',
    '',
    `${brand.name} · ${[brand.supportPhone, brand.supportEmail, brand.website].filter(Boolean).join(' · ')}`,
    brand.poweredBy,
  ].join('\n')

  return { html, text }
}

/** Minimal inline markup: **bold** and [label](url). Everything else is escaped. */
function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" style="color:inherit;font-weight:600;">$1</a>')
}

function strip(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)')
}
