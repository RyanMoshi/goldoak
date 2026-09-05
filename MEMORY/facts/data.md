---
name: data
description: "Static data layer — all content in lib/ TypeScript files, no database."
metadata.type: fact
---

## Overview
GoldOak has NO database. All content is hardcoded in `lib/` TypeScript files. Edit these files to change site content.

## Data Files

### lib/contact.ts
Contact information: phone (+254 729 911 311), email (info@goldoak.co.ke), WhatsApp URL, location (Nairobi), business hours (weekday/Sat/Sun/emergency), social media placeholders.

### lib/navigation.ts
- `mainNav`: 6 top-level items (Home, About, Solutions [with 7 children], How We Work, Claims, Contact)
- `footerNav`: explore links, client types, legal (privacy/terms — pages don't exist yet)

### lib/insurers.ts
- `insurers[]`: 8 insurers (Jubilee, APA, AAR, AIG, Britam, CIC, Old Mutual, Prudential)
- `claimsSteps[]`: 6 steps (Notify, Register, Document, Track, Settle, Close) with timeframes
- `clientSegments[]`: 3 segments (Individual, SME, Corporate) with service tags

### lib/process.ts
- `processStages[]`: 7 stages (Understand, Solve, Compare, Implement, Support, Claims, Review & Renew) each with number, title, description, output
- `processPrinciples[]`: 4 principles (Risk Before Product, Appropriate Over Cheap, Options Not Assumptions, The Relationship Outlives the Policy)

### lib/solutions.ts
- `solutionCategories[]`: 7 categories (Health & Life, Motor, Property & Assets, Liability, People & Statutory, Personal Lines, Specialty) each with id, name, description, segments, solutions list
- `solutionDetails[]`: 6 detailed solution definitions (Individual Medical, Group Medical, Comprehensive Motor, Fire & Perils, Public Liability, WIBA) with whatItIs, whoNeedsIt, whatItProtects, keyConsiderations, informationNeeded, howGoldOakHelps

### lib/pdfGenerator.ts
jsPDF-based PDF generator for insurance quote applications. Uses brand navy (#004B87) and gold (#C19A6B). Generates branded header, personal info, insurance details, uploaded docs section, footer.

## How to Update Content
1. Open the relevant `lib/` file
2. Edit the data arrays/objects
3. Run `npm run build` to verify
4. Changes appear on next page load (static data, no CMS)

## Adding New Data
- Create a new `lib/your-data.ts` file
- Export typed arrays/objects
- Import in components that need it
- Follow existing patterns (typed interfaces, named exports)
