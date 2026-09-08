import { callout, formatDate, money, paletteFor, paragraph, renderPdf, section, statusChip, table, title, totals, twoColumns, type PdfFrame, type Row } from '@/lib/pdf/document'
import { defaultsFor } from '@/services/billing'
import type { BillingDocument } from '@/types/billing'
import type { Organization } from '@/types/platform'

/**
 * The quote and invoice PDF. One layout serves both: the wording, the date
 * labels and the closing block change with `kind`. Line descriptions and
 * customer details wrap and paginate; the totals block is always drawn whole,
 * on a new page if it would not fit under the last line.
 */

const TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad'> = {
  draft: 'neutral',
  sent: 'warn',
  accepted: 'good',
  paid: 'good',
  part_paid: 'warn',
  rejected: 'bad',
  expired: 'bad',
  overdue: 'bad',
  cancelled: 'neutral',
  a: 'neutral',
}

const STATUS_TEXT: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
  part_paid: 'Part paid',
  paid: 'Paid',
  overdue: 'Overdue',
}

export async function billingPdf(doc: BillingDocument, org: Organization): Promise<{ buffer: Buffer; filename: string }> {
  const isQuote = doc.kind === 'quote'
  const p = paletteFor(org)
  const d = defaultsFor(org)
  const frame: PdfFrame = {
    organization: org,
    title: isQuote ? 'Quotation' : 'Invoice',
    number: doc.number,
    generatedAt: new Date(doc.issueDate),
    footerNote: isQuote
      ? `Quotation ${doc.number} · valid until ${doc.dueDate ? formatDate(doc.dueDate) : 'further notice'} · premiums are subject to insurer confirmation.`
      : `Invoice ${doc.number} · ${doc.dueDate ? `payable by ${formatDate(doc.dueDate)}` : 'payable on receipt'} · please quote the invoice number with any payment.`,
  }

  const buffer = await renderPdf(frame, (pdf) => {
    title(pdf, isQuote ? 'Quotation' : 'Invoice', `${doc.number} · ${formatDate(doc.issueDate)}`, p)
    statusChip(pdf, STATUS_TEXT[doc.status] ?? doc.status, TONE[doc.status] ?? 'neutral', p)

    twoColumns(
      pdf,
      {
        heading: 'From',
        lines: [org.name, org.address ?? '', [org.phone, org.email].filter(Boolean).join(' · '), org.website ?? '', org.licenceLabel ?? ''],
      },
      {
        heading: isQuote ? 'Prepared for' : 'Billed to',
        lines: [doc.customerName, doc.customerAddress ?? '', doc.customerEmail ?? '', doc.customerPhone ? `+${doc.customerPhone.replace(/^\+/, '')}` : ''],
      },
      p,
    )

    const meta: [string, string][] = [
      [isQuote ? 'Quotation number' : 'Invoice number', doc.number],
      ['Date of issue', formatDate(doc.issueDate)],
      [isQuote ? 'Valid until' : 'Payment due', doc.dueDate ? formatDate(doc.dueDate) : '—'],
    ]
    if (doc.reference) meta.push(['Your reference', doc.reference])
    if (doc.createdByName) meta.push(['Prepared by', doc.createdByName])
    section(pdf, 'Details', p)
    table(
      pdf,
      [
        { label: 'Field', width: 34 },
        { label: 'Value', width: 66 },
      ],
      meta.map(([k, v]) => [k, v] as Row),
      p,
      { zebra: false },
    )

    section(pdf, isQuote ? 'What is being quoted' : 'What is being charged', p)
    const showTax = doc.lines.some((l) => l.taxPercent > 0)
    const showDiscount = doc.lines.some((l) => l.discountPercent > 0)
    const columns = [
      { label: 'Description', width: showTax || showDiscount ? 40 : 50 },
      { label: 'Qty', width: 9, align: 'right' as const },
      { label: 'Unit price', width: 17, align: 'right' as const },
      ...(showDiscount ? [{ label: 'Disc.', width: 9, align: 'right' as const }] : []),
      ...(showTax ? [{ label: d.taxLabel, width: 9, align: 'right' as const }] : []),
      { label: 'Amount', width: 20, align: 'right' as const },
    ]
    const rows: Row[] = doc.lines.map((l) => {
      const row: Row = [{ text: l.description, detail: l.detail }, { text: trimNumber(l.quantity) }, { text: money(l.unitPrice, doc.currency) }]
      if (showDiscount) row.push({ text: l.discountPercent ? `${trimNumber(l.discountPercent)}%` : '—' })
      if (showTax) row.push({ text: l.taxPercent ? `${trimNumber(l.taxPercent)}%` : '—' })
      row.push({ text: money(l.amount, doc.currency) })
      return row
    })
    table(pdf, columns, rows, p, { emptyText: 'No lines on this document.' })

    const totalRows = [{ label: 'Subtotal', value: money(doc.subtotal, doc.currency) }]
    if (doc.discountTotal > 0) totalRows.push({ label: 'Discount', value: `− ${money(doc.discountTotal, doc.currency)}` })
    if (doc.taxTotal > 0) totalRows.push({ label: d.taxLabel, value: money(doc.taxTotal, doc.currency) })
    totalRows.push({ label: isQuote ? 'Total quoted' : 'Total due', value: money(doc.total, doc.currency), strong: true } as never)
    if (!isQuote && doc.amountPaid > 0) {
      totalRows.push({ label: 'Paid to date', value: money(doc.amountPaid, doc.currency) })
      totalRows.push({ label: 'Balance', value: money(doc.total - doc.amountPaid, doc.currency) })
    }
    totals(pdf, totalRows, p)

    if (doc.notes) {
      section(pdf, 'Notes', p)
      paragraph(pdf, doc.notes, p)
    }
    if (!isQuote && doc.paymentInstructions) {
      section(pdf, 'How to pay', p)
      paragraph(pdf, doc.paymentInstructions, p)
    }
    if (doc.terms) {
      section(pdf, 'Terms and conditions', p)
      paragraph(pdf, doc.terms, p)
    }

    callout(
      pdf,
      isQuote
        ? `To accept this quotation, reply to ${org.email || 'your adviser'} or message ${org.phone || 'the agency'} quoting ${doc.number}. Cover starts only once the insurer confirms and the premium is settled.`
        : `Please quote ${doc.number} with your payment. Questions about this invoice? Contact ${org.name}${org.phone ? ` on ${org.phone}` : ''}${org.email ? ` or ${org.email}` : ''}.`,
      p,
    )
  })

  return { buffer, filename: `${doc.number}-${isQuote ? 'quotation' : 'invoice'}.pdf` }
}

function trimNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)
}
