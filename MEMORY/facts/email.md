---
name: email
description: "Nodemailer SMTP config, email templates, and environment variables."
metadata.type: fact
---

## Email System
GoldOak uses **nodemailer** for sending emails from contact and application forms. No database — emails are sent directly via SMTP.

## Environment Variables
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="GoldOak Insurance <your-email@gmail.com>"
ADMIN_EMAIL=info@goldoak.co.ke
```

See `env.example` for the template.

## Email Flow

### Contact Form (/api/contact)
1. User submits Risk Review form or Quote Request
2. Server validates form data
3. Admin email sent to `info@goldoak.co.ke` with BCC to `projectryan9@gmail.com`
4. Client confirmation email sent to user's email
5. Uploaded files (ID, passport, policy docs) attached to admin email
6. GoldOak logo embedded as CID image in both emails

### Application Form (/api/send-form)
1. User submits insurance application with file uploads
2. Server processes multipart/form-data
3. Admin notification sent with form data + file attachments
4. Client confirmation sent

## SMTP Provider
- **Gmail** with App Password (not regular password)
- Generate App Password: Google Account → Security → 2-Step Verification → App Passwords
- Use 16-character app password, not regular Gmail password

## Email Templates
- Branded HTML templates with GoldOak navy (#004B87) and gold (#C19A6B)
- GoldOak logo embedded as CID image (not inline attachment)
- Both admin and client receive branded emails
