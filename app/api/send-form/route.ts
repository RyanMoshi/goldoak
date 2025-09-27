import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const idNumber = formData.get('idNumber') as string
    const county = formData.get('county') as string
    const insuranceType = JSON.parse(formData.get('insuranceType') as string || '[]')
    const numberOfPeople = formData.get('numberOfPeople') as string
    const businessName = formData.get('businessName') as string
    const preferredInsurer = formData.get('preferredInsurer') as string
    const budgetRange = formData.get('budgetRange') as string
    const currentInsurance = formData.get('currentInsurance') as string
    const currentInsurer = formData.get('currentInsurer') as string
    const coverageStartDate = formData.get('coverageStartDate') as string
    const notes = formData.get('notes') as string
    const experienceChoice = formData.get('experienceChoice') as string
    
    // Extract files
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value)
      }
    }

    // Validate required fields
    if (!fullName || !email || !phone) {
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
          <h1 style="color: white; margin: 0; font-size: 24px;">New Insurance Quote Request</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">From Goldoak Insurance Website</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #004B87; margin-top: 0;">Personal Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Full Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">ID Number:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${idNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">County:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${county}</td>
            </tr>
          </table>
          
          <h2 style="color: #004B87; margin-top: 30px;">Insurance Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Insurance Types:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${insuranceType.join(', ')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Number of People:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${numberOfPeople || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Business Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${businessName || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Insurer:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${preferredInsurer || 'No preference'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Budget Range:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${budgetRange || 'Not specified'}</td>
            </tr>
          </table>
          
          <h2 style="color: #004B87; margin-top: 30px;">Additional Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Current Insurance:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${currentInsurance || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Current Insurer:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${currentInsurer || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Coverage Start Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${coverageStartDate || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Experience Choice:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${experienceChoice === 'self' ? 'Fill form myself' : 'Get assistance from advisor'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Files Uploaded:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${files.length} file(s)</td>
            </tr>
          </table>
          
          ${notes ? `
          <h2 style="color: #004B87; margin-top: 30px;">Notes / Special Requests</h2>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #C19A6B; margin: 20px 0;">
            <p style="margin: 0; color: #333;">${notes}</p>
          </div>
          ` : ''}
          
          <div style="background: #004B87; color: white; padding: 20px; margin-top: 30px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0;">Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Contact the client within 2 hours</li>
              <li>Provide quotes from multiple insurers</li>
              <li>Schedule a consultation if needed</li>
              <li>Follow up on the application process</li>
            </ul>
          </div>
        </div>
      </div>
    `

    // Prepare attachments
    const attachments = await Promise.all(files.map(async (file, index) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
    })))

    // Send email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject: `New Insurance Quote Request from ${fullName}`,
      html: htmlContent,
      attachments: attachments,
    }

    await transporter.sendMail(mailOptions)

    // Send confirmation email to client
    const clientHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #004B87 0%, #C19A6B 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Quote Request!</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Goldoak Insurance Agency</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Dear ${fullName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for choosing Goldoak Insurance Agency for your insurance needs. We have received your quote request and our team will contact you within 2 hours.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #004B87; margin-top: 0;">What happens next?</h3>
            <ul style="color: #333; line-height: 1.6;">
              <li>Our insurance experts will review your requirements</li>
              <li>We'll obtain quotes from multiple insurance companies</li>
              <li>We'll contact you with the best options available</li>
              <li>We'll help you compare and choose the right coverage</li>
            </ul>
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
      subject: 'Thank you for your insurance quote request - Goldoak Insurance',
      html: clientHtmlContent,
    }

    await transporter.sendMail(clientMailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}
