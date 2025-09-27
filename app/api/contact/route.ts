import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, preferredContact } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Prepare email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #004B87 0%, #C19A6B 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">From Goldoak Insurance Website</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #004B87; margin-top: 0;">Contact Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Contact:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${preferredContact || 'Not specified'}</td>
            </tr>
          </table>
          
          <h2 style="color: #004B87; margin-top: 30px;">Message</h2>
          <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #C19A6B; margin: 20px 0;">
            <p style="margin: 0; color: #333; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="background: #004B87; color: white; padding: 20px; margin-top: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Respond to the client within 2 hours</li>
              <li>Address their specific inquiry</li>
              <li>Provide relevant insurance information</li>
              <li>Schedule a consultation if needed</li>
            </ul>
          </div>
        </div>
      </div>
    `

    // Send email to admin
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)

    // Send confirmation email to client
    const clientHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #004B87 0%, #C19A6B 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Goldoak Insurance Agency</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Dear ${name},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for reaching out to Goldoak Insurance Agency. We have received your message and our team will contact you within 2 hours.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #004B87; margin-top: 0;">Your Message</h3>
            <p style="color: #333; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          
          <div style="background: #C19A6B; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Need immediate assistance?</h3>
            <p style="margin: 0; font-size: 14px;">
              Call us: <strong>+254 729 911 311</strong><br>
              WhatsApp: <strong>+254 729 911 311</strong><br>
              Email: <strong>info@goldoak.co.ke</strong>
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>Goldoak Insurance Agency Team</strong>
          </p>
        </div>
      </div>
    `

    const clientMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting us - Goldoak Insurance',
      html: clientHtmlContent,
    }

    await transporter.sendMail(clientMailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
