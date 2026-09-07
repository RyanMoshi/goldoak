import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { isStaffRole } from '@/lib/auth/session'
import { getSql, hasDatabase } from '@/lib/db/client'
import { audit } from '@/services/audit'
import { agencyReportPdf, claimPdf, clientSummaryPdf, quotePdf, registrationPdf, type DocumentType } from '@/services/documents'
import { clientForUser } from '@/services/journey'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/documents/<type>?id=<subject>
 * Staff may fetch any document in their organisation. Clients may fetch their
 * own registration, cover summary, claim and quote confirmations.
 */
export async function GET(request: Request, { params }: { params: { type: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  if (!hasDatabase()) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  const type = params.type as DocumentType
  const id = new URL(request.url).searchParams.get('id') ?? ''
  const staff = isStaffRole(session.role)

  try {
    let result = null
    if (type === 'agency-report') {
      if (!staff) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 })
      result = await agencyReportPdf(session.oid, session.uid)
    } else {
      const clientId = staff ? await clientIdFor(type, id, session.oid) : (await clientForUser(session.uid))?.id ?? null
      if (!clientId) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
      if (!staff && !(await subjectBelongsToClient(type, id, clientId))) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
      if (type === 'registration') result = await registrationPdf(session.oid, clientId, session.uid)
      else if (type === 'client-summary') result = await clientSummaryPdf(session.oid, clientId, session.uid)
      else if (type === 'claim') result = await claimPdf(session.oid, id, session.uid)
      else if (type === 'quote') result = await quotePdf(session.oid, id, session.uid)
      else return NextResponse.json({ error: 'Unknown document type.' }, { status: 404 })
    }
    if (!result) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    await audit({ organizationId: session.oid, actorUserId: session.uid, action: 'document.generated', target: result.number, detail: { type, id } })
    return new Response(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${result.filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Document-Number': result.number,
      },
    })
  } catch (error) {
    console.error('document failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Could not generate the document.' }, { status: 500 })
  }
}

/** For staff: resolve the client that owns the subject (and check the organisation). */
async function clientIdFor(type: DocumentType, id: string, organizationId: string): Promise<string | null> {
  const sql = getSql()
  if (type === 'registration' || type === 'client-summary') {
    const rows = await sql`SELECT id FROM clients WHERE id = ${id} AND organization_id = ${organizationId} LIMIT 1`
    return rows[0] ? String(rows[0].id) : null
  }
  if (type === 'claim') {
    const rows = await sql`SELECT client_id FROM claims WHERE id = ${id} AND organization_id = ${organizationId} LIMIT 1`
    return rows[0] ? String(rows[0].client_id) : null
  }
  if (type === 'quote') {
    const rows = await sql`SELECT client_id FROM quote_requests WHERE id = ${id} AND organization_id = ${organizationId} LIMIT 1`
    return rows[0] ? String(rows[0].client_id) : null
  }
  return null
}

/** For clients: the subject must be theirs. */
async function subjectBelongsToClient(type: DocumentType, id: string, clientId: string): Promise<boolean> {
  const sql = getSql()
  if (type === 'registration' || type === 'client-summary') return true
  if (type === 'claim') return (await sql`SELECT 1 FROM claims WHERE id = ${id} AND client_id = ${clientId} LIMIT 1`).length > 0
  if (type === 'quote') return (await sql`SELECT 1 FROM quote_requests WHERE id = ${id} AND client_id = ${clientId} LIMIT 1`).length > 0
  return false
}
