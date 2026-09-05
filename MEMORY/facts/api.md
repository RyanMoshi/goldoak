---
name: api
description: "API endpoints, nodemailer SMTP, file upload, and email templates."
metadata.type: fact
---

## API Routes

### POST /api/contact
- Handles both JSON and multipart/form-data
- Two form types: `risk_review` (from contact page) and `quote_request`
- Sends branded HTML email to admin (info@goldoak.co.ke) with BCC to projectryan9@gmail.com
- Sends confirmation email to client
- Attaches uploaded files (ID photo, passport photo, policy docs) to admin email
- Attaches GoldOak logo as CID embedded image in emails

### POST /api/send-form
- Multipart/form-data with file uploads
- Insurance application form submission
- Sends admin notification + client confirmation via nodemailer
- File attachments included in admin email

### POST /api/upload
- Generic file upload endpoint
- Saves files to `public/uploads/` with timestamp prefix
- Returns public URL

## Nodemailer SMTP Config (env vars)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="GoldOak Insurance <your-email@gmail.com>"
ADMIN_EMAIL=info@goldoak.co.ke
```

## Email Templates
- Both admin and client emails use branded HTML templates
- Admin email includes: form data, uploaded file attachments, GoldOak logo as CID image
- Client email includes: confirmation message, GoldOak branding

## File Upload
- Destination: `public/uploads/`
- Naming: timestamp prefix on original filename
- Returns: public URL path
- Used by: contact form (ID/passport photos), application form (policy docs)
