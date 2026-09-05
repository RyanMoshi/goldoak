---
name: add-feature
description: "How to add a new page, API route, or component."
metadata.type: playbook
---

## Adding a New Page

### Step 1: Create the file
```bash
# Public page (all pages are public — no auth)
app/your-page/page.tsx
```

### Step 2: Write the component
```tsx
"use client"; // if using hooks, state, or browser APIs

export default function YourPage() {
  return <div>...</div>;
}
```

### Step 3: Add to navigation
- **Main nav:** Edit `lib/navigation.ts` — add to `mainNav` array
- **Footer nav:** Edit `lib/navigation.ts` — add to `footerNav` array

### Step 4: Verify
```bash
npx tsc --noEmit          # TypeScript clean
npm run build             # Build passes
# Visit the page in browser — renders correctly
```

## Adding an API Route

### Step 1: Create the file
```bash
# New endpoint
app/api/your-endpoint/route.ts
```

### Step 2: Write the handler
```tsx
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: "..." });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // process data
  return NextResponse.json({ result: "..." });
}
```

### Step 3: Verify
```bash
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

## Adding a Component

### Step 1: Create the file
```bash
components/your-component.tsx      # generic UI component
```

### Step 2: Use existing patterns
- Copy the pattern from `Button.tsx` for variants
- Use brand colors from `tailwind.config.js` theme
- Use `AnimatedSection` for scroll animations
- Use `SectionHeader` for section headings with gold accent lines

### Step 3: Import and use
```tsx
import { YourComponent } from "@/components/your-component";
```

## Adding Content Data

### Step 1: Create or edit lib file
```bash
lib/your-data.ts      # new data file
# or edit existing: lib/solutions.ts, lib/process.ts, etc.
```

### Step 2: Export typed data
```tsx
export interface YourItem {
  id: string;
  name: string;
  // ...
}

export const yourItems: YourItem[] = [
  { id: "1", name: "..." },
];
```

### Step 3: Import in components
```tsx
import { yourItems } from "@/lib/your-data";
```

## Decision Rules
- **Client vs Server:** Use `"use client"` if the component uses hooks, state, event handlers, or browser APIs. Otherwise, leave as server component.
- **Page vs Component:** If it's a route, put it in `app/`. If it's reusable UI, put it in `components/`.
- **Data vs API:** If data is static, put it in `lib/`. If it needs server-side logic (email, file upload), use `app/api/`.
