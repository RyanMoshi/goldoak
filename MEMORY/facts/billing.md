---
name: billing
description: "Quotations and invoices: one table for both, per-agency numbering, totals arithmetic, statuses, sending, PDFs and the share link."
metadata.type: fact
---

## One shape, two documents
`billing_documents` holds quotations and invoices; `kind` decides the wording, the numbering series and the status vocabulary. Lines live in `billing_lines` (position, description, detail, quantity, unit_price, discount_percent, tax_percent, amount). `services/billing.ts` is the only place that writes either.

## Numbering
`number_sequences (organization_id, kind, period)` is incremented with `INSERT … ON CONFLICT DO UPDATE … RETURNING`, so two people saving at once cannot collide or reuse a number. Format `QT-2026-0001` / `INV-2026-0001`; the prefixes come from `organizations.settings` (`quotePrefix`, `invoicePrefix`).

## Money
Per line: `base = quantity × unit_price`, `discount = base × discount% `, `net = base − discount`, `tax = net × tax%`, `amount = net + tax`. Header totals are recomputed from the lines on every save, so the screen, the PDF and the database can never disagree. Two decimals, rounded once at the end. The form computes the same arithmetic client-side for a live total.

## Statuses
Quotations: `draft → sent → accepted | rejected | expired | cancelled`. Invoices: `draft → sent → part_paid → paid`, or `overdue`. `recordPayment` adds to `amount_paid` and settles the invoice when the balance reaches zero. `refreshOverdue()` (daily sweep) marks overdue invoices and expired quotations.

## Sending
- **Email with the PDF attached**: `sendDocumentEmail` (templates `quote-sent`, `invoice-sent`, `invoice-reminder`), delivered inline because the PDF is already in memory; logged in `email_log` like every other email. Sending marks the document `sent`.
- **Share link**: `ensureShareToken` mints a random token; `/d/<token>` is a public, unbranded-by-platform page in the agency's own colours, and `/api/billing/<id>/pdf?token=…` returns the PDF. The token is the only credential; without it the route needs a session in the owning agency.
- **Download**: `/api/billing/<id>/pdf` for signed-in staff of the owning agency. Another agency gets 404 (verified in production).

## PDFs
`lib/pdf/document.ts` is shared by every generated document. It takes the agency's colours (`branding.primary` / `accent`) and logo, wraps every table cell, measures each row before drawing it so a row never splits across pages, repeats the column header on a new page, keeps headings with their content, and stamps `Page n of m`.

**Trap that cost a rewrite:** pdfkit adds a page whenever text is written past the bottom margin. Stamping the footer there appended one blank page per page (a 3-page quote came out as 12). `withoutPageBreaks()` zeroes the margins while the header and footer are drawn.

**Second trap:** pdfkit reads its `.afm` font metrics from disk, so every serverless function that renders a PDF needs `outputFileTracingIncludes` for `./node_modules/pdfkit/js/**` — including the *pages* whose server actions build a PDF, not only the API routes. See `next.config.js`.

## Reminders
The daily sweep chases overdue invoices on day 1, 7, 14 and 30 only (never daily) with `invoice-reminder`, which links to the share page when there is one.
