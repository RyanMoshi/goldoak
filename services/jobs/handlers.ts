import { sendWhatsApp, sendWhatsAppDocument } from '@/lib/whatsapp/provider'
import { registerJob } from '@/services/jobs'
import { refreshSummary } from '@/services/memory'
import { processUpload } from '@/services/uploads'

/**
 * Job handlers, registered once per server instance. Import this module from
 * anywhere that runs jobs (webhooks, cron, admin) so the registry is filled.
 */

let registered = false

export function registerJobHandlers(): void {
  if (registered) return
  registered = true

  registerJob('ocr-upload', async (job) => {
    const uploadId = String(job.payload.uploadId ?? '')
    if (!uploadId) throw new Error('uploadId missing')
    await processUpload(uploadId)
    // Tell the person what we read, and let them confirm.
    const { afterUploadProcessed } = await import('@/lib/whatsapp/bot')
    await afterUploadProcessed(uploadId)
  })

  registerJob('memory-summary', async (job) => {
    const phone = String(job.payload.phone ?? '')
    if (phone) await refreshSummary(phone)
  })

  registerJob('whatsapp-send', async (job) => {
    const phone = String(job.payload.phone ?? '')
    const text = String(job.payload.text ?? '')
    if (!phone || !text) return
    const ok = await sendWhatsApp(phone, text, job.organizationId)
    if (!ok) throw new Error('gateway did not accept the message')
  })

  registerJob('whatsapp-send-document', async (job) => {
    const phone = String(job.payload.phone ?? '')
    const url = String(job.payload.url ?? '')
    const filename = String(job.payload.filename ?? 'document.pdf')
    const caption = job.payload.caption ? String(job.payload.caption) : undefined
    if (!phone || !url) return
    const ok = await sendWhatsAppDocument(phone, { url, mimetype: 'application/pdf', filename, caption }, job.organizationId)
    if (!ok) throw new Error('gateway did not accept the document')
  })

  registerJob('web-answer', async (job) => {
    const { answerWebMessage } = await import('@/services/webchat')
    await answerWebMessage(String(job.payload.userId ?? ''), String(job.payload.organizationId ?? ''), String(job.payload.questionId ?? ''))
  })

  registerJob('email-send', async (job) => {
    const { deliverQueuedEmail } = await import('@/services/emails')
    await deliverQueuedEmail(String(job.payload.logId ?? ''), job.payload as never)
  })

  registerJob('process-inbound', async (job) => {
    const { processInbound } = await import('@/lib/whatsapp/bot')
    await processInbound(job.payload as never)
  })
}
