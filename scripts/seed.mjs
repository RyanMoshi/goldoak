// Seeds the GoldOak database by calling the deployment's protected seed endpoint,
// so the database credentials never need to leave Vercel.
//
//   npm run db:seed                      -> https://goldoak.vercel.app
//   SEED_URL=http://localhost:3000 npm run db:seed
//
// Needs ADMIN_TOKEN in .env.local (same value as the Vercel ADMIN_TOKEN variable).

const base = (process.env.SEED_URL || 'https://goldoak.vercel.app').replace(/\/$/, '')
const token = process.env.ADMIN_TOKEN

if (!token) {
  console.error('ADMIN_TOKEN is not set in .env.local.')
  process.exit(1)
}

const response = await fetch(`${base}/api/admin/seed`, { method: 'POST', headers: { 'x-admin-token': token } })
const body = await response.json().catch(() => ({}))
if (!response.ok || !body.ok) {
  console.error('Seed failed:', response.status, body)
  process.exit(1)
}
console.log(`Seeded ${base}:`, body)
console.log('Agency sign-in:  agency@goldoak.co.ke / GoldOak2026!')
console.log('Client sign-in:  mwangi@example.com / GoldOak2026!  (also wanjiru@example.com, apex@example.com)')
