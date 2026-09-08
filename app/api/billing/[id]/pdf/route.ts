import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { billingPdf } from '@/services/billing-pdf'
import { getDocument, getSharedDocument } from '@/services/billing'
import { getOrganization, placeholderOrganization } from '@/services/users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The PDF for one quote or invoice.
 *
 * Two ways in, both authorised: a signed-in member of the agency that owns
 * the document, or anyone holding the document's share token (`?token=`),
 * which is what the emailed link uses. No other path returns the file.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const token = new URL(request.url).searchParams.get('token')
  try {
    if (token) {
      const shared = await getSharedDocument(token)
      if (!shared || shared.document.id !== params.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const org = (await getOrganization(shared.organizationId)) ?? placeholderOrganization(shared.organizationId)
      const pdf = await billingPdf(shared.document, org)
      return file(pdf)
    }
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Sign in first' }, { status: 401 })
    const doc = await getDocument(session.oid, params.id)
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const org = (await getOrganization(session.oid)) ?? placeholderOrganization(session.oid)
    const pdf = await billingPdf(doc, org)
    return file(pdf)
  } catch (error) {
    console.error('billing pdf failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Could not build the document' }, { status: 500 })
  }
}

function file(pdf: { buffer: Buffer; filename: string }): NextResponse {
  return new NextResponse(new Uint8Array(pdf.buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${pdf.filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
