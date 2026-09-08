import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/server'
import { isStaffRole } from '@/lib/auth/session'
import { channelForOrganization, channelStatus } from '@/lib/whatsapp/channels'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Live status (and pairing QR) of the signed-in agency's own WhatsApp number. Polled by the WhatsApp page. */
export async function GET() {
  const session = await getSession()
  if (!session || !isStaffRole(session.role)) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  const channel = await channelForOrganization(session.oid)
  if (!channel) return NextResponse.json({ connected: false })
  const status = await channelStatus(channel)
  return NextResponse.json({ connected: true, channel: { id: channel.id, label: channel.label, createdAt: channel.createdAt }, ...status }, { headers: { 'Cache-Control': 'no-store' } })
}
