---
name: fix-build
description: "Common build failures and their fixes."
metadata.type: playbook
---

## Diagnosis Steps
```bash
# 1. TypeScript errors
npx tsc --noEmit 2>&1

# 2. Build output
npm run build 2>&1 | tail -50

# 3. Lint errors
npm run lint 2>&1
```

## Common Failures and Fixes

### "Module not found" or "Cannot find module"
**Cause:** Missing dependency or wrong import path.
**Fix:**
```bash
npm install
# Check import uses @/ alias for project root files
```

### "Type error" / "Property does not exist"
**Cause:** TypeScript strict mode catching type issues.
**Fix:** Read the error line number. Usually a missing prop or wrong type. Add the missing type or fix the prop.

### "Environment variable not found"
**Cause:** `.env` file missing or variable not set.
**Fix:** Ensure `.env` exists with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL`.

### Build hangs or times out
**Cause:** Usually infinite loop in server component or heavy computation.
**Fix:** Check for `while(true)`, recursive calls, or missing `async/await`.

### Tailwind classes not working
**Cause:** Tailwind v3 uses `tailwind.config.js`, not v4 `@theme` in globals.css.
**Fix:** Ensure the color/class is defined in `tailwind.config.js` under `theme.extend`.

### Image domain errors
**Cause:** `next.config.js` doesn't allow the image domain.
**Fix:** Add the domain to `images.remotePatterns` in `next.config.js`.

## Verify Recipe
```bash
# Clean build from scratch
rm -rf .next
npm install
npm run build
# All routes should appear in output
# No errors, no warnings about missing modules
```

## Nuclear Option
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run build
```
