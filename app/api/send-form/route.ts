import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Form submission started ===')
    const formData = await request.formData()
    console.log('Form data received, fields:', Array.from(formData.keys()))
    
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
    console.log('Validating fields:', { fullName, email, phone })
    if (!fullName || !email || !phone) {
      console.log('Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email transporter
    const smtpPort = parseInt(process.env.SMTP_PORT || '587')
    console.log('SMTP config:', { 
      host: process.env.SMTP_HOST, 
      port: smtpPort, 
      secure: smtpPort === 465,
      user: process.env.SMTP_USER ? '***' : 'NOT_SET'
    })
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003220; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Insurance Quote Request</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">From GoldOak Insurance Website</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #003220; margin-top: 0;">Personal Information</h2>
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
          
          <h2 style="color: #003220; margin-top: 30px;">Insurance Details</h2>
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
          
          <h2 style="color: #003220; margin-top: 30px;">Additional Information</h2>
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
          <h2 style="color: #003220; margin-top: 30px;">Notes / Special Requests</h2>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #BE862B; margin: 20px 0;">
            <p style="margin: 0; color: #333;">${notes}</p>
          </div>
          ` : ''}
          
          <div style="background: #003220; color: white; padding: 20px; margin-top: 30px; border-radius: 8px;">
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
      from: '"GoldOak Insurance" <info@goldoak.co.ke>',
      to: 'info@goldoak.co.ke',
      bcc: 'projectryan9@gmail.com',
      subject: `New Insurance Application - ${fullName}`,
      html: htmlContent,
      attachments: attachments,
    }

    console.log('Sending admin email...')
    await transporter.sendMail(mailOptions)
    console.log('Admin email sent successfully')

    // Send confirmation email to client
    const clientHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003220; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Thank You – We've Received Your Insurance Application</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">GoldOak Insurance Agency</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #003220; margin-top: 0;">Thank you, ${fullName}!</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We've received your insurance application and one of our advisors will be in touch shortly.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #003220; margin-top: 0;">Application Summary</h3>
            <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Insurance Type:</strong> ${insuranceType.join(', ')}</li>
              <li><strong>Preferred Insurer:</strong> ${preferredInsurer || 'No preference'}</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            If you have any urgent questions, you can reach us directly on:
          </p>
          
          <div style="background: #BE862B; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
              📞 <a href="tel:+254729911311" style="color: white; text-decoration: none;">+254729911311</a><br />
              💬 <a href="https://wa.me/254729911311" style="color: white; text-decoration: none;">Chat on WhatsApp</a><br />
              📧 <a href="mailto:info@goldoak.co.ke" style="color: white; text-decoration: none;">info@goldoak.co.ke</a>
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            — The Goldoak Team
          </p>
        </div>
      </div>
    `

    const clientMailOptions = {
      from: '"GoldOak Insurance" <info@goldoak.co.ke>',
      to: email,
      subject: 'Thank You – We\'ve Received Your Insurance Application',
      html: clientHtmlContent,
    }

    console.log('Sending client confirmation email...')
    await transporter.sendMail(clientMailOptions)
    console.log('Client email sent successfully')

    console.log('=== Form submission completed successfully ===')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('=== Form submission error ===')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Full error:', error)
    return NextResponse.json(
      { error: 'Failed to submit form', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
