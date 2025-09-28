import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    let body: any = {}
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    } else {
      body = await request.json()
    }
    
    console.log('Contact API - Received data:', body)
    
    const { 
      name, email, phone, subject, message, preferredContact, type, 
      fullName, idNumber, county, preferredContactMethod,
      insuranceType, preferredInsurer, coverageValue, policyStartDate, policyDuration, currentInsurance,
      additionalInfo, prefersCall, subscribeUpdates,
      idPhotoUrl, passportPhotoUrl, existingPolicyDocsUrls
    } = body

    // Handle different form types
    const isQuoteRequest = type === 'quote_request'
    const formName = isQuoteRequest ? fullName : name
    const formSubject = isQuoteRequest ? 'New Insurance Quote Request' : subject
    const formMessage = isQuoteRequest ? additionalInfo : message

    // Validate required fields
    console.log('Validation check:', { formName, email, formMessage, isQuoteRequest })
    if (!formName || !email) {
      console.log('Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields', details: { formName, email, formMessage } },
        { status: 400 }
      )
    }
    
    // For quote requests, additionalInfo is optional, so we'll use a default message if empty
    const finalMessage = isQuoteRequest && !formMessage 
      ? `Insurance quote request for ${insuranceType || 'general insurance'}. ${prefersCall ? 'Client prefers to be called.' : ''}`
      : formMessage

    // Create email transporter
    const smtpPort = parseInt(process.env.SMTP_PORT || '587')
    console.log('SMTP config:', { 
      host: process.env.SMTP_HOST, 
      port: smtpPort, 
      secure: smtpPort === 465,
      user: process.env.SMTP_USER ? '***' : 'NOT_SET',
      pass: process.env.SMTP_PASS ? '***' : 'NOT_SET'
    })
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP configuration missing')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      // Use TLS only for implicit TLS (465). For STARTTLS ports like 587, set secure to false.
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Prepare email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isQuoteRequest ? 'New Insurance Quote Request' : 'New Contact Form Submission'}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #003220 0%, #004d2a 100%); padding: 40px 30px; text-align: center; position: relative;">
            <div style="margin: 0 auto 20px; text-align: center;">
              <img src="cid:goldoaklogo" alt="GoldOak Insurance Logo" style="height: 60px; width: auto; max-width: 60px;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">${isQuoteRequest ? 'New Insurance Quote Request' : 'New Contact Form Submission'}</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">GoldOak Insurance Agency</p>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #BE862B;"></div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Contact Information Section -->
            <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h2 style="color: #003220; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 20px; margin-right: 12px; border-radius: 2px;"></span>
                Contact Information
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; width: 150px; color: #374151;">Name:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${formName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Email:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Phone:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${phone || 'Not provided'}</td>
                </tr>
                ${isQuoteRequest ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">ID Number:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${idNumber || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">County:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${county || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Preferred Contact:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${preferredContactMethod || 'Not specified'}</td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Subject:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Preferred Contact:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${preferredContact || 'Not specified'}</td>
                </tr>
                `}
              </table>
            </div>
            
            ${isQuoteRequest ? `
            <!-- Insurance Details Section -->
            <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h2 style="color: #003220; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 20px; margin-right: 12px; border-radius: 2px;"></span>
                Insurance Details
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151; width: 150px;">Insurance Type:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${insuranceType || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Preferred Insurer:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${preferredInsurer || 'No preference'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Coverage Value:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${coverageValue || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Policy Start Date:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${policyStartDate || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Policy Duration:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${policyDuration || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Current Insurance:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${currentInsurance || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Prefers Call:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${prefersCall ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #374151;">Subscribe Updates:</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${subscribeUpdates ? 'Yes' : 'No'}</td>
                </tr>
              </table>
            </div>
            ` : ''}
            
            ${isQuoteRequest && (idPhotoUrl || passportPhotoUrl || existingPolicyDocsUrls) ? `
            <!-- File Attachments Section -->
            <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h2 style="color: #003220; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 20px; margin-right: 12px; border-radius: 2px;"></span>
                Uploaded Documents
              </h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                ${idPhotoUrl ? `
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 24px; margin-bottom: 10px;">🆔</div>
                  <p style="margin: 0; font-weight: 600; color: #111827; margin-bottom: 10px;">ID Photo</p>
                  <a href="${idPhotoUrl}" target="_blank" style="color: #003220; text-decoration: none; font-size: 14px; background: #BE862B; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block;">View Document</a>
                </div>
                ` : ''}
                ${passportPhotoUrl ? `
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="font-size: 24px; margin-bottom: 10px;">📄</div>
                  <p style="margin: 0; font-weight: 600; color: #111827; margin-bottom: 10px;">Passport Photo</p>
                  <a href="${passportPhotoUrl}" target="_blank" style="color: #003220; text-decoration: none; font-size: 14px; background: #BE862B; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block;">View Document</a>
                </div>
                ` : ''}
              </div>
              ${existingPolicyDocsUrls && existingPolicyDocsUrls.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3 style="color: #003220; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Existing Policy Documents</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                  ${existingPolicyDocsUrls.map((url: string, index: number) => `
                  <a href="${url}" target="_blank" style="color: #003220; text-decoration: none; font-size: 14px; background: #f8fafc; border: 1px solid #e5e7eb; padding: 8px 16px; border-radius: 4px; display: inline-block;">Document ${index + 1}</a>
                  `).join('')}
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <!-- Message Section -->
            <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h2 style="color: #003220; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 20px; margin-right: 12px; border-radius: 2px;"></span>
                ${isQuoteRequest ? 'Additional Information' : 'Message'}
              </h2>
              <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #BE862B; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 15px;">${finalMessage}</p>
              </div>
            </div>
            
            <!-- Next Steps Section -->
            <div style="background: linear-gradient(135deg, #003220 0%, #004d2a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 18px; margin-right: 12px; border-radius: 2px;"></span>
                Next Steps
              </h3>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                <li style="margin-bottom: 8px;">Respond to the client within 2 hours</li>
                <li style="margin-bottom: 8px;">Address their specific inquiry</li>
                <li style="margin-bottom: 8px;">Provide relevant insurance information</li>
                <li style="margin-bottom: 8px;">Schedule a consultation if needed</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <div style="background: #003220; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                GoldOak Insurance Agency
              </div>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
              📞 +254 729 911 311 | 📧 info@goldoak.co.ke | 🌐 Nairobi, Kenya<br>
              Licensed by the Insurance Regulatory Authority of Kenya
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Read logo file for embedding
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'Gold Icon.png')
    let logoAttachment = null
    
    try {
      if (fs.existsSync(logoPath)) {
        const logoContent = fs.readFileSync(logoPath)
        logoAttachment = {
          filename: 'goldoak-logo.png',
          content: logoContent,
          cid: 'goldoaklogo'
        }
      }
    } catch (error) {
      console.log('Logo file not found, using fallback')
    }

    // Prepare file attachments for uploaded documents
    const fileAttachments = []
    
    if (isQuoteRequest) {
      // Add ID Photo attachment
      if (idPhotoUrl) {
        try {
          const idFilePath = idPhotoUrl.replace(/^.*\/uploads\//, '')
          const fullIdPath = path.join(process.cwd(), 'public', 'uploads', idFilePath)
          if (fs.existsSync(fullIdPath)) {
            const idContent = fs.readFileSync(fullIdPath)
            fileAttachments.push({
              filename: `ID-Photo-${formName.replace(/\s+/g, '-')}.jpg`,
              content: idContent
            })
          }
        } catch (error) {
          console.log('ID photo file not found:', error)
        }
      }

      // Add Passport Photo attachment
      if (passportPhotoUrl) {
        try {
          const passportFilePath = passportPhotoUrl.replace(/^.*\/uploads\//, '')
          const fullPassportPath = path.join(process.cwd(), 'public', 'uploads', passportFilePath)
          if (fs.existsSync(fullPassportPath)) {
            const passportContent = fs.readFileSync(fullPassportPath)
            fileAttachments.push({
              filename: `Passport-Photo-${formName.replace(/\s+/g, '-')}.jpg`,
              content: passportContent
            })
          }
        } catch (error) {
          console.log('Passport photo file not found:', error)
        }
      }

      // Add existing policy documents attachments
      if (existingPolicyDocsUrls && Array.isArray(existingPolicyDocsUrls)) {
        existingPolicyDocsUrls.forEach((docUrl, index) => {
          try {
            const docFilePath = docUrl.replace(/^.*\/uploads\//, '')
            const fullDocPath = path.join(process.cwd(), 'public', 'uploads', docFilePath)
            if (fs.existsSync(fullDocPath)) {
              const docContent = fs.readFileSync(fullDocPath)
              const fileExtension = path.extname(docFilePath) || '.pdf'
              fileAttachments.push({
                filename: `Policy-Document-${index + 1}-${formName.replace(/\s+/g, '-')}${fileExtension}`,
                content: docContent
              })
            }
          } catch (error) {
            console.log(`Policy document ${index + 1} not found:`, error)
          }
        })
      }
    }

    // Send email to admin
    const adminAttachments = []
    if (logoAttachment) adminAttachments.push(logoAttachment)
    adminAttachments.push(...fileAttachments)

    const mailOptions = {
      from: '"GoldOak Insurance" <info@goldoak.co.ke>',
      to: 'info@goldoak.co.ke',
      bcc: 'projectryan9@gmail.com',
      subject: isQuoteRequest ? 'New Insurance Quote Request' : `New Contact Form Submission: ${subject}`,
      html: htmlContent,
      attachments: adminAttachments
    }

    console.log('Sending admin email...')
    await transporter.sendMail(mailOptions)
    console.log('Admin email sent successfully')

    // Send confirmation email to client
    const clientHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isQuoteRequest ? 'Thank You – GoldOak Insurance' : 'Thank You for Contacting Us!'}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #003220 0%, #004d2a 100%); padding: 40px 30px; text-align: center; position: relative;">
            <div style="margin: 0 auto 20px; text-align: center;">
              <img src="cid:goldoaklogo" alt="GoldOak Insurance Logo" style="height: 60px; width: auto; max-width: 60px;" />
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">${isQuoteRequest ? 'Thank You – GoldOak Insurance' : 'Thank You for Contacting Us!'}</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">GoldOak Insurance Agency</p>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #BE862B;"></div>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Greeting -->
            <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>${formName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                ${isQuoteRequest 
                  ? 'Thank you for your insurance quote request. We have received your application and our team will contact you within 2 hours with quotes from multiple insurance providers.'
                  : 'Thank you for reaching out to GoldOak Insurance Agency. We have received your message and our team will contact you within 2 hours.'
                }
              </p>
            </div>
            
            <!-- Request Summary -->
            <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h3 style="color: #003220; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 18px; margin-right: 12px; border-radius: 2px;"></span>
                ${isQuoteRequest ? 'Your Quote Request Summary' : 'Your Message'}
              </h3>
              <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #BE862B; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #374151; line-height: 1.6; font-size: 15px;">${finalMessage}</p>
              </div>
            </div>
            
            <!-- What Happens Next -->
            <div style="background: linear-gradient(135deg, #003220 0%, #004d2a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 18px; margin-right: 12px; border-radius: 2px;"></span>
                What Happens Next?
              </h3>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                <li style="margin-bottom: 8px;">Our team will review your request within 2 hours</li>
                <li style="margin-bottom: 8px;">We'll contact you with personalized quotes</li>
                <li style="margin-bottom: 8px;">We'll help you compare and choose the best option</li>
                <li style="margin-bottom: 8px;">No obligation - completely free service</li>
              </ul>
            </div>
            
            <!-- Contact Information -->
            <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h3 style="color: #003220; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                <span style="background: #BE862B; width: 4px; height: 18px; margin-right: 12px; border-radius: 2px;"></span>
                Need Immediate Assistance?
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                  <div style="font-size: 24px; margin-bottom: 10px;">📞</div>
                  <p style="margin: 0; font-weight: 600; color: #111827;">+254 729 911 311</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Call us anytime</p>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
                  <div style="font-size: 24px; margin-bottom: 10px;">💬</div>
                  <p style="margin: 0; font-weight: 600; color: #111827;">WhatsApp</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Chat with us</p>
                </div>
              </div>
              <div style="text-align: center; margin-top: 20px; padding: 15px; background: #BE862B; color: white; border-radius: 8px;">
                <p style="margin: 0; font-weight: 600;">📧 info@goldoak.co.ke</p>
              </div>
            </div>
            
            <!-- Signature -->
            <div style="text-align: center; padding: 20px 0;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                Best regards,<br>
                <strong style="color: #003220; font-size: 18px;">GoldOak Insurance Agency Team</strong>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <div style="background: #003220; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                GoldOak Insurance Agency
              </div>
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
              📞 +254 729 911 311 | 📧 info@goldoak.co.ke | 🌐 Nairobi, Kenya<br>
              Licensed by the Insurance Regulatory Authority of Kenya
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const clientMailOptions = {
      from: '"GoldOak Insurance" <info@goldoak.co.ke>',
      to: email,
      subject: isQuoteRequest ? 'Thank You – GoldOak Insurance' : 'Thank you for contacting us - GoldOak Insurance',
      html: clientHtmlContent,
      attachments: logoAttachment ? [logoAttachment] : []
    }

    console.log('Sending client confirmation email...')
    await transporter.sendMail(clientMailOptions)
    console.log('Client email sent successfully')

    console.log('=== Contact form submission completed successfully ===')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('=== Contact form error ===')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Full error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
