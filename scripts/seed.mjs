// Bootstraps the platform (organisation + platform admin) through the deployment's
// protected endpoint, so database credentials never leave Vercel.
//
//   npm run db:seed                       -> https://goldoak.vercel.app
//   npm run db:seed -- --purge            -> also removes the old demo data
//   SEED_URL=http://localhost:3000 npm run db:seed
//
// Needs ADMIN_TOKEN in .env.local (same value as the Vercel ADMIN_TOKEN variable).
// The admin password comes from ADMIN_PASSWORD (Vercel env) unless SEED_ADMIN_PASSWORD is set here.

const base = (process.env.SEED_URL || 'https://goldoak.vercel.app').replace(/\/$/, '')
const token = process.env.ADMIN_TOKEN
if (!token) {
  console.error('ADMIN_TOKEN is not set in .env.local.')
  process.exit(1)
}

const body = {
  purgeDemo: process.argv.includes('--purge'),
  adminEmail: process.env.SEED_ADMIN_EMAIL,
  adminPassword: process.env.SEED_ADMIN_PASSWORD,
  adminName: process.env.SEED_ADMIN_NAME,
}

const response = await fetch(`${base}/api/admin/seed`, {
  method: 'POST',
  headers: { 'x-admin-token': token, 'content-type': 'application/json' },
  body: JSON.stringify(body),
})
const result = await response.json().catch(() => ({}))
if (!response.ok || !result.ok) {
  console.error('Bootstrap failed:', response.status, result)
  process.exit(1)
}
console.log(`Bootstrapped ${base}:`, result)
