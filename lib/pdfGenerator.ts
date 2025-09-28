import jsPDF from 'jspdf'

interface FormData {
  fullName: string
  email: string
  phone: string
  idNumber?: string
  county?: string
  preferredContactMethod?: string
  insuranceType: string | string[]
  preferredInsurer?: string
  coverageValue?: string
  policyStartDate?: string
  policyDuration?: string
  currentInsurance?: string
  numberOfPeople?: number
  businessName?: string
  budgetRange?: string
  currentInsurer?: string
  coverageStartDate?: string
  notes?: string
  additionalInfo?: string
  prefersCall?: boolean
  subscribeUpdates?: boolean
  experienceChoice?: string
  idPhotoUrl?: string
  passportPhotoUrl?: string
  existingPolicyDocsUrls?: string[]
}

export const generateInsurancePDF = (data: FormData): jsPDF => {
  const doc = new jsPDF()
  
  // Add logo placeholder (circular with G)
  doc.setFillColor(190, 134, 43) // #BE862B
  doc.circle(35, 25, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('G', 31, 29)
  
  // Header with brand colors
  doc.setFillColor(0, 50, 32) // #003220
  doc.rect(0, 0, 210, 50, 'F')
  
  // Add title
  doc.setTextColor(190, 134, 43) // #BE862B
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GOLDOAK INSURANCE AGENCY', 60, 25)
  
  // Add subtitle
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Insurance Quote Application', 60, 35)
  
  // Add tagline
  doc.setFontSize(10)
  doc.text('Your Trusted Insurance Partner', 60, 42)
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  let yPosition = 70
  
  // Application Details Section
  doc.setFillColor(190, 134, 43) // #BE862B
  doc.rect(15, yPosition - 5, 180, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('INSURANCE QUOTE APPLICATION', 20, yPosition)
  
  yPosition += 15
  
  // Personal Information
  doc.setTextColor(0, 50, 32) // #003220
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Personal Information:', 20, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Full Name: ${data.fullName}`, 25, yPosition)
  yPosition += 6
  doc.text(`Email: ${data.email}`, 25, yPosition)
  yPosition += 6
  doc.text(`Phone: ${data.phone}`, 25, yPosition)
  yPosition += 6
  if (data.idNumber) {
    doc.text(`ID Number: ${data.idNumber}`, 25, yPosition)
    yPosition += 6
  }
  if (data.county) {
    doc.text(`County: ${data.county}`, 25, yPosition)
    yPosition += 6
  }
  if (data.preferredContactMethod) {
    doc.text(`Preferred Contact: ${data.preferredContactMethod}`, 25, yPosition)
    yPosition += 6
  }
  yPosition += 10
  
  // Insurance Details
  doc.setTextColor(0, 50, 32) // #003220
  doc.setFont('helvetica', 'bold')
  doc.text('Insurance Details:', 20, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  const insuranceTypeText = Array.isArray(data.insuranceType) 
    ? data.insuranceType.join(', ') 
    : data.insuranceType
  doc.text(`Insurance Type: ${insuranceTypeText}`, 25, yPosition)
  yPosition += 6
  
  if (data.preferredInsurer) {
    doc.text(`Preferred Insurer: ${data.preferredInsurer}`, 25, yPosition)
    yPosition += 6
  }
  if (data.coverageValue) {
    doc.text(`Coverage Value: ${data.coverageValue}`, 25, yPosition)
    yPosition += 6
  }
  if (data.policyStartDate) {
    doc.text(`Policy Start Date: ${data.policyStartDate}`, 25, yPosition)
    yPosition += 6
  }
  if (data.policyDuration) {
    doc.text(`Policy Duration: ${data.policyDuration}`, 25, yPosition)
    yPosition += 6
  }
  if (data.currentInsurance) {
    doc.text(`Current Insurance: ${data.currentInsurance}`, 25, yPosition)
    yPosition += 6
  }
  if (data.numberOfPeople) {
    doc.text(`Number of People: ${data.numberOfPeople}`, 25, yPosition)
    yPosition += 6
  }
  if (data.businessName) {
    doc.text(`Business Name: ${data.businessName}`, 25, yPosition)
    yPosition += 6
  }
  if (data.budgetRange) {
    doc.text(`Budget Range: ${data.budgetRange}`, 25, yPosition)
    yPosition += 6
  }
  yPosition += 10
  
  // Additional Information
  doc.setTextColor(0, 50, 32) // #003220
  doc.setFont('helvetica', 'bold')
  doc.text('Additional Information:', 20, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  if (data.currentInsurer) {
    doc.text(`Current Insurer: ${data.currentInsurer}`, 25, yPosition)
    yPosition += 6
  }
  if (data.coverageStartDate) {
    doc.text(`Coverage Start Date: ${data.coverageStartDate}`, 25, yPosition)
    yPosition += 6
  }
  if (data.notes) {
    doc.text(`Notes: ${data.notes}`, 25, yPosition)
    yPosition += 6
  }
  if (data.additionalInfo) {
    doc.text(`Additional Info: ${data.additionalInfo}`, 25, yPosition)
    yPosition += 6
  }
  
  // Preferences
  doc.setTextColor(0, 50, 32) // #003220
  doc.setFont('helvetica', 'bold')
  doc.text('Preferences:', 20, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  if (data.prefersCall !== undefined) {
    doc.text(`Prefers Call: ${data.prefersCall ? 'Yes' : 'No'}`, 25, yPosition)
    yPosition += 6
  }
  if (data.subscribeUpdates !== undefined) {
    doc.text(`Subscribe Updates: ${data.subscribeUpdates ? 'Yes' : 'No'}`, 25, yPosition)
    yPosition += 6
  }
  yPosition += 15
  
  // Uploaded Documents Section
  doc.setTextColor(0, 50, 32) // #003220
  doc.setFont('helvetica', 'bold')
  doc.text('Uploaded Documents:', 20, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  // Check for uploaded files
  const hasUploads = data.idPhotoUrl || data.passportPhotoUrl || data.existingPolicyDocsUrls
  
  if (hasUploads) {
    doc.text('✓ ID Photo: Uploaded', 25, yPosition)
    yPosition += 6
    doc.text('✓ Passport Photo: Uploaded', 25, yPosition)
    yPosition += 6
    
    if (data.existingPolicyDocsUrls && data.existingPolicyDocsUrls.length > 0) {
      doc.text(`✓ Additional Documents: ${data.existingPolicyDocsUrls.length} file(s) uploaded`, 25, yPosition)
      yPosition += 6
    }
  } else {
    doc.text('No documents uploaded', 25, yPosition)
    yPosition += 6
  }
  
  yPosition += 10
  
  // Footer
  yPosition = Math.max(yPosition + 20, 280)
  doc.setFillColor(0, 50, 32) // #003220
  doc.rect(0, yPosition, 210, 25, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('GoldOak Insurance Agency', 20, yPosition + 10)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Licensed by the Insurance Regulatory Authority of Kenya', 20, yPosition + 18)
  doc.text('Phone: +254 729 911 311 | Email: info@goldoak.co.ke | Nairobi, Kenya', 20, yPosition + 22)
  
  return doc
}
