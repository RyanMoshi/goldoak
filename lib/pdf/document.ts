import { existsSync, readFileSync } from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import type { Organization } from '@/types/platform'

/**
 * Server-side PDF rendering with pdfkit.
 *
 * Every document shares one frame: a branded header band with the agency's
 * own colours and logo, and a footer with contact details and page numbers.
 * Templates draw only the body and never worry about page breaks: `table()`
 * measures each row before drawing it, repeats the column header on a new
 * page and never splits a row down the middle; `section()`, `keyValues()`
 * and `callout()` keep their heading with the content that follows.
 *
 * Colours come from the organisation's branding, so a quote from Literal
 * Insurance looks like Literal Insurance, not like GoldOak.
 */

export const COLORS = { forest: '#073423', gold: '#c28d38', ink: '#16211b', muted: '#5d6b63', line: '#e8e3d5', canvas: '#f7f4ec', white: '#ffffff' }

export interface Palette {
  primary: string
  accent: string
  ink: string
  muted: string
  line: string
  canvas: string
  onPrimary: string
}

export interface PdfFrame {
  organization: Organization
  title: string
  subtitle?: string
  number: string
  generatedAt?: Date
  /** Replaces the standard "not a policy contract" line. */
  footerNote?: string
  palette?: Palette
  logo?: Buffer | null
}

export type Doc = PDFKit.PDFDocument

export const MARGIN = 48
const HEADER_H = 92
const FOOTER_H = 58
const HEX = /^#[0-9a-fA-F]{6}$/

export function paletteFor(org: Organization | null): Palette {
  const b = org?.branding ?? {}
  const primary = HEX.test(String(b.primary ?? '')) ? String(b.primary) : COLORS.forest
  const accent = HEX.test(String(b.accent ?? '')) ? String(b.accent) : COLORS.gold
  return { primary, accent, ink: COLORS.ink, muted: COLORS.muted, line: COLORS.line, canvas: COLORS.canvas, onPrimary: readableOn(primary) }
}

/** White or near-black, whichever reads on the given background. */
function readableOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.6 ? '#16211b' : '#ffffff'
}

/**
 * The agency logo for the header. Only local files under `public/` are read:
 * a PDF must render in milliseconds and must not depend on a remote host.
 */
export function logoFor(org: Organization | null): Buffer | null {
  const candidates: string[] = []
  const url = String(org?.branding?.logoUrl ?? '')
  if (url.startsWith('/')) candidates.push(decodeURIComponent(url))
  if (org?.logoPath) candidates.push(org.logoPath.startsWith('/') ? org.logoPath : `/${org.logoPath}`)
  for (const rel of candidates) {
    if (!/\.(png|jpg|jpeg)$/i.test(rel)) continue
    const file = path.join(process.cwd(), 'public', rel.replace(/^\/+/, ''))
    if (!file.startsWith(path.join(process.cwd(), 'public'))) continue
    try {
      if (existsSync(file)) return readFileSync(file)
    } catch {
      /* unreadable: fall through to the wordmark */
    }
  }
  return null
}

/**
 * The palette of the document being drawn. Templates draw synchronously
 * inside renderPdf, so the helpers can read it without every call site
 * threading it through; passing one explicitly still wins.
 */
let currentPalette: Palette | null = null

function active(explicit?: Palette): Palette {
  return explicit ?? currentPalette ?? paletteFor(null)
}

export function renderPdf(frame: PdfFrame, body: (doc: Doc, frame: PdfFrame) => void): Promise<Buffer> {
  const full: PdfFrame = { ...frame, palette: frame.palette ?? paletteFor(frame.organization), logo: frame.logo ?? logoFor(frame.organization) }
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: HEADER_H + 30, bottom: FOOTER_H + 18, left: MARGIN, right: MARGIN },
      bufferPages: true,
      info: { Title: `${frame.title} ${frame.number}`, Author: frame.organization.name, Creator: 'Super Agent', Subject: frame.subtitle ?? frame.title },
    })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    try {
      currentPalette = full.palette!
      body(doc, full)
      finish(doc, full)
      doc.end()
    } catch (error) {
      reject(error)
    } finally {
      currentPalette = null
    }
  })
}

/** Usable width between the margins. */
export function contentWidth(doc: Doc): number {
  return doc.page.width - MARGIN * 2
}

/** The lowest y a template may draw on before the footer starts. */
export function bottomLimit(doc: Doc): number {
  return doc.page.height - FOOTER_H - 14
}

/** Starts a new page when `needed` points would run into the footer. */
export function ensureSpace(doc: Doc, needed: number): void {
  if (doc.y + needed > bottomLimit(doc)) doc.addPage()
}

function drawHeader(doc: Doc, frame: PdfFrame) {
  const p = frame.palette!
  const width = doc.page.width
  doc.save()
  doc.rect(0, 0, width, HEADER_H).fill(p.primary)
  doc.rect(0, HEADER_H, width, 3).fill(p.accent)

  let x = MARGIN
  if (frame.logo) {
    try {
      doc.image(frame.logo, x, 22, { fit: [40, 40] })
      x += 52
    } catch {
      /* not a readable image: fall back to text only */
    }
  }
  const nameWidth = width - x - MARGIN - 190
  doc.fillColor(p.onPrimary).font('Helvetica-Bold').fontSize(15).text(frame.organization.name, x, 26, { width: nameWidth, lineBreak: false, ellipsis: true })
  const sub = [frame.organization.licenceLabel, frame.organization.website].filter(Boolean).join('  ·  ')
  doc
    .fillColor(p.onPrimary === '#ffffff' ? '#ffffffb3' : '#16211bb3')
    .font('Helvetica')
    .fontSize(8.5)
    .text(sub || 'Insurance intermediary', x, 46, { width: nameWidth, lineBreak: false, ellipsis: true })
  const contact = [frame.organization.phone, frame.organization.email].filter(Boolean).join('  ·  ')
  if (contact) doc.text(contact, x, 60, { width: nameWidth, lineBreak: false, ellipsis: true })

  doc.fillColor(p.accent).font('Helvetica-Bold').fontSize(9).text(frame.title.toUpperCase(), width - MARGIN - 190, 26, { width: 190, align: 'right', characterSpacing: 1.2 })
  doc.fillColor(p.onPrimary).font('Helvetica-Bold').fontSize(12).text(frame.number, width - MARGIN - 190, 41, { width: 190, align: 'right' })
  doc
    .fillColor(p.onPrimary === '#ffffff' ? '#ffffffb3' : '#16211bb3')
    .font('Helvetica')
    .fontSize(8.5)
    .text(formatDate(frame.generatedAt ?? new Date()), width - MARGIN - 190, 58, { width: 190, align: 'right' })
  doc.restore()
}

function drawFooter(doc: Doc, frame: PdfFrame, page: number, total: number) {
  const p = frame.palette!
  const width = doc.page.width
  const y = doc.page.height - FOOTER_H
  doc.save()
  doc
    .moveTo(MARGIN, y)
    .lineTo(width - MARGIN, y)
    .lineWidth(0.5)
    .strokeColor(p.line)
    .stroke()
  doc.fillColor(p.muted).font('Helvetica').fontSize(7.5)
  const contact = [frame.organization.phone, frame.organization.email, frame.organization.address].filter(Boolean).join('  ·  ')
  doc.text(`${frame.organization.name}${contact ? `  ·  ${contact}` : ''}`, MARGIN, y + 10, { width: width - MARGIN * 2 - 110, lineBreak: false, ellipsis: true })
  doc.text(frame.footerNote ?? 'This document summarises records held by the agency and is not a policy contract.', MARGIN, y + 22, { width: width - MARGIN * 2 - 110, lineBreak: false, ellipsis: true })
  doc.fillColor(p.ink).font('Helvetica-Bold').fontSize(8).text(`Page ${page} of ${total}`, width - MARGIN - 110, y + 10, { width: 110, align: 'right' })
  doc.restore()
}

function finish(doc: Doc, frame: PdfFrame) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    drawHeader(doc, frame)
    drawFooter(doc, frame, i - range.start + 1, range.count)
  }
}

/* ---------- Body helpers ---------- */

export function title(doc: Doc, text: string, subtitle?: string, palette?: Palette) {
  const p = active(palette)
  doc.fillColor(p.primary).font('Helvetica-Bold').fontSize(20).text(text, { width: contentWidth(doc) })
  if (subtitle) doc.moveDown(0.25).fillColor(p.muted).font('Helvetica').fontSize(10.5).text(subtitle, { width: contentWidth(doc) })
  doc.moveDown(0.8)
}

export function section(doc: Doc, text: string, palette?: Palette) {
  const p = active(palette)
  // A heading alone at the bottom of a page reads as a mistake: take it with us.
  ensureSpace(doc, 56)
  doc.moveDown(0.6)
  doc.fillColor(p.accent).font('Helvetica-Bold').fontSize(8.5).text(text.toUpperCase(), MARGIN, doc.y, { width: contentWidth(doc), characterSpacing: 1.2 })
  const y = doc.y + 3
  doc
    .moveTo(MARGIN, y)
    .lineTo(doc.page.width - MARGIN, y)
    .lineWidth(0.5)
    .strokeColor(p.line)
    .stroke()
  doc.y = y + 8
}

export function paragraph(doc: Doc, text: string, palette?: Palette) {
  const p = active(palette)
  doc.fillColor(p.ink).font('Helvetica').fontSize(10).text(text, MARGIN, doc.y, { width: contentWidth(doc), lineGap: 2.5, align: 'left' })
  doc.moveDown(0.5)
}

export function keyValues(doc: Doc, rows: [string, string][], palette?: Palette) {
  const p = active(palette)
  const labelW = 150
  const valueW = contentWidth(doc) - labelW
  for (const [label, value] of rows) {
    const text = value || '—'
    const h = Math.max(doc.heightOfString(text, { width: valueW }), 13)
    ensureSpace(doc, h + 6)
    const y = doc.y
    doc.fillColor(p.muted).font('Helvetica').fontSize(9.5).text(label, MARGIN, y + 0.5, { width: labelW - 10 })
    doc.fillColor(p.ink).font('Helvetica-Bold').fontSize(10).text(text, MARGIN + labelW, y, { width: valueW })
    doc.y = y + h + 5
  }
  doc.moveDown(0.3)
}

/** Two blocks side by side, e.g. "From" and "Billed to". */
export function twoColumns(doc: Doc, left: { heading: string; lines: string[] }, right: { heading: string; lines: string[] }, palette?: Palette) {
  const p = active(palette)
  const gap = 24
  const colW = (contentWidth(doc) - gap) / 2
  const draw = (block: { heading: string; lines: string[] }, x: number, y: number): number => {
    doc.fillColor(p.muted).font('Helvetica-Bold').fontSize(8).text(block.heading.toUpperCase(), x, y, { width: colW, characterSpacing: 1 })
    let cy = doc.y + 3
    for (const [i, line] of block.lines.filter(Boolean).entries()) {
      doc
        .fillColor(i === 0 ? p.ink : p.muted)
        .font(i === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(i === 0 ? 11 : 9.5)
        .text(line, x, cy, { width: colW })
      cy = doc.y + 1.5
    }
    return cy
  }
  const startY = doc.y
  const leftEnd = draw(left, MARGIN, startY)
  const rightEnd = draw(right, MARGIN + colW + gap, startY)
  doc.y = Math.max(leftEnd, rightEnd) + 10
}

export interface Column {
  label: string
  /** Share of the available width; the columns are normalised to fill it. */
  width: number
  align?: 'left' | 'right' | 'center'
}

export interface Cell {
  text: string
  /** Smaller grey line under the main text, wrapped like the rest. */
  detail?: string | null
}

export type Row = (string | Cell)[]

const asCell = (c: string | Cell): Cell => (typeof c === 'string' ? { text: c } : c)

/**
 * A table that survives real content: every cell wraps, the row is as tall as
 * its tallest cell, a row that would not fit moves whole to the next page and
 * the column header is repeated there.
 */
export function table(doc: Doc, columns: Column[], rows: Row[], palette?: Palette, options: { zebra?: boolean; emptyText?: string } = {}) {
  const p = active(palette)
  const total = columns.reduce((s, c) => s + c.width, 0)
  const avail = contentWidth(doc)
  const widths = columns.map((c) => (c.width / total) * avail)
  const padX = 7
  const padY = 6

  const drawHead = () => {
    const h = 22
    ensureSpace(doc, h + 24)
    const y = doc.y
    doc.rect(MARGIN, y, avail, h).fill(p.canvas)
    let x = MARGIN
    doc.fillColor(p.muted).font('Helvetica-Bold').fontSize(7.8)
    columns.forEach((c, i) => {
      doc.text(c.label.toUpperCase(), x + padX, y + 7.5, { width: widths[i] - padX * 2, align: c.align ?? 'left', characterSpacing: 0.7, lineBreak: false, ellipsis: true })
      x += widths[i]
    })
    doc.y = y + h
  }

  const rowHeight = (row: Row): number => {
    let h = 0
    row.forEach((raw, i) => {
      const cell = asCell(raw)
      doc.font('Helvetica').fontSize(9.5)
      let cellH = doc.heightOfString(cell.text || '—', { width: widths[i] - padX * 2 })
      if (cell.detail) {
        doc.font('Helvetica').fontSize(8)
        cellH += doc.heightOfString(cell.detail, { width: widths[i] - padX * 2 }) + 2
      }
      h = Math.max(h, cellH)
    })
    return Math.max(h + padY * 2, 24)
  }

  drawHead()
  if (!rows.length) {
    const y = doc.y
    doc
      .fillColor(p.muted)
      .font('Helvetica-Oblique')
      .fontSize(9.5)
      .text(options.emptyText ?? 'Nothing recorded yet.', MARGIN + padX, y + 8, { width: avail - padX * 2 })
    doc.y = y + 30
    doc.moveDown(0.4)
    return
  }

  rows.forEach((row, index) => {
    const h = rowHeight(row)
    if (doc.y + h > bottomLimit(doc)) {
      doc.addPage()
      drawHead()
    }
    const y = doc.y
    if (options.zebra !== false && index % 2 === 1) doc.rect(MARGIN, y, avail, h).fill('#fbfaf6')
    let x = MARGIN
    row.forEach((raw, i) => {
      const cell = asCell(raw)
      const c = columns[i]
      doc
        .fillColor(p.ink)
        .font('Helvetica')
        .fontSize(9.5)
        .text(cell.text || '—', x + padX, y + padY, { width: widths[i] - padX * 2, align: c.align ?? 'left' })
      if (cell.detail) {
        doc
          .fillColor(p.muted)
          .font('Helvetica')
          .fontSize(8)
          .text(cell.detail, x + padX, doc.y + 1, { width: widths[i] - padX * 2, align: c.align ?? 'left' })
      }
      x += widths[i]
    })
    doc
      .moveTo(MARGIN, y + h)
      .lineTo(doc.page.width - MARGIN, y + h)
      .lineWidth(0.4)
      .strokeColor(p.line)
      .stroke()
    doc.y = y + h
  })
  doc.moveDown(0.7)
}

/** Right-aligned totals block; the final line is emphasised. */
export function totals(doc: Doc, rows: { label: string; value: string; strong?: boolean }[], palette?: Palette) {
  const p = active(palette)
  const blockW = 250
  const x = doc.page.width - MARGIN - blockW
  const height = rows.reduce((s, r) => s + (r.strong ? 30 : 20), 0) + 8
  ensureSpace(doc, height)
  let y = doc.y + 4
  for (const r of rows) {
    if (r.strong) {
      doc.rect(x, y - 3, blockW, 28).fill(p.primary)
      doc.fillColor(p.onPrimary).font('Helvetica-Bold').fontSize(10).text(r.label, x + 12, y + 6, { width: blockW / 2 - 12 })
      doc
        .fillColor(p.onPrimary)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(r.value, x + blockW / 2, y + 4, { width: blockW / 2 - 12, align: 'right' })
      y += 30
    } else {
      doc.fillColor(p.muted).font('Helvetica').fontSize(9.5).text(r.label, x + 12, y, { width: blockW / 2 - 12 })
      doc
        .fillColor(p.ink)
        .font('Helvetica')
        .fontSize(9.5)
        .text(r.value, x + blockW / 2, y, { width: blockW / 2 - 12, align: 'right' })
      y += 18
    }
  }
  doc.y = y + 6
}

export function callout(doc: Doc, text: string, palette?: Palette) {
  const p = active(palette)
  const w = contentWidth(doc)
  doc.font('Helvetica').fontSize(10)
  const h = doc.heightOfString(text, { width: w - 30 }) + 22
  ensureSpace(doc, h + 10)
  const y = doc.y
  doc.rect(MARGIN, y, w, h).fill(p.canvas)
  doc.rect(MARGIN, y, 3, h).fill(p.accent)
  doc
    .fillColor(p.ink)
    .font('Helvetica')
    .fontSize(10)
    .text(text, MARGIN + 15, y + 11, { width: w - 30 })
  doc.y = y + h
  doc.moveDown(0.8)
}

/** A coloured status chip, drawn inline at the current position. */
export function statusChip(doc: Doc, label: string, tone: 'neutral' | 'good' | 'warn' | 'bad', palette?: Palette) {
  const p = active(palette)
  const colors = { neutral: p.muted, good: '#1f7a4d', warn: '#a86a12', bad: '#a3352c' }
  doc.font('Helvetica-Bold').fontSize(8)
  const w = doc.widthOfString(label.toUpperCase(), { characterSpacing: 0.8 }) + 18
  const y = doc.y
  doc.roundedRect(MARGIN, y, w, 18, 9).fill(colors[tone])
  doc
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(label.toUpperCase(), MARGIN + 9, y + 5.5, { characterSpacing: 0.8, lineBreak: false })
  doc.y = y + 24
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' }).format(date)
}

export function kes(amount: number | null): string {
  if (amount == null) return '—'
  return `KES ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(Math.round(amount))}`
}

/** Money in the document's own currency, with decimals where they matter. */
export function money(amount: number | null, currency = 'KES'): string {
  if (amount == null) return '—'
  const whole = Math.abs(amount % 1) < 0.005
  return `${currency} ${new Intl.NumberFormat('en-KE', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount)}`
}
