'use server'

import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/auth/server'
import { completeTask } from '@/services/agency/dashboard'

/** Marks a work-queue task as done for the signed-in agency. */
export async function completeTaskAction(taskId: string): Promise<{ ok: boolean }> {
  const session = await requireSession('agency')
  try {
    await completeTask(session.oid, taskId)
    revalidatePath('/agency/today')
    return { ok: true }
  } catch (error) {
    console.error('completeTask failed', error instanceof Error ? error.message : error)
    return { ok: false }
  }
}
