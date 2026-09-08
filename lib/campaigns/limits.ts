/**
 * Shared campaign limits. Kept out of the actions module because a
 * "use server" file may only export async functions.
 */

/** Above this many recipients, the sender must type the count to confirm. */
export const LARGE_CAMPAIGN = 50
