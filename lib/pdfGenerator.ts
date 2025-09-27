import jsPDF from 'jspdf'

interface FormData {
  fullName: string
  email: string
  phone: string
  idNumber: string
  county: string
  insuranceType: string[]
  numberOfPeople: number
  businessName: string
  preferredInsurer: string
  budgetRange: string
  currentInsurance: string
  currentInsurer: string
  coverageStartDate: string
  notes: string
  experienceChoice: string
}

export const generateInsurancePDF = (data: FormData): jsPDF => {
  const doc = new jsPDF()
  
  // Add header with logo
  doc.setFillColor(0, 75, 135) // #004B87
  doc.rect(0, 0, 210, 40, 'F')
  
  // Add title
  doc.setTextColor(201, 154, 107) // #C19A6B
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GOLDOAK INSURANCE AGENCY', 20, 25)
  
  // Add subtitle
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Insurance Application Confirmation', 20, 35)
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  let yPosition = 60
  
  // Application Details Section
  doc.setFillColor(201, 154, 107) // #C19A6B
  doc.rect(15, yPosition - 5, 180, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('APPLICATION DETAILS', 20, yPosition)
  
  yPosition += 15
  
  // Personal Information
  doc.setTextColor(0, 0, 0)
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
  doc.text(`ID Number: ${data.idNumber}`, 25, yPosition)
  yPosition += 6
  doc.text(`County: ${data.county}`, 25, yPosition)
  yPosition += 10
  
  // Insurance Details
  doc.setFont('helvetica', 'bold')
  doc.text('Insurance Details:', 20, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Insurance Types: ${data.insuranceType.join(', ')}`, 25, yPosition)
  yPosition += 6
  doc.text(`Number of People: ${data.numberOfPeople}`, 25, yPosition)
  yPosition += 6
  if (data.businessName) {
    doc.text(`Business Name: ${data.businessName}`, 25, yPosition)
    yPosition += 6
  }
  doc.text(`Preferred Insurer: ${data.preferredInsurer || 'No preference'}`, 25, yPosition)
  yPosition += 6
  doc.text(`Budget Range: ${data.budgetRange || 'Not specified'}`, 25, yPosition)
  yPosition += 10
  
  // Additional Information
  doc.setFont('helvetica', 'bold')
  doc.text('Additional Information:', 20, yPosition)
  yPosition += 8
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Current Insurance: ${data.currentInsurance || 'Not specified'}`, 25, yPosition)
  yPosition += 6
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
  
  // Footer
  yPosition = 280
  doc.setFillColor(0, 75, 135) // #004B87
  doc.rect(0, yPosition, 210, 20, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Goldoak Insurance Agency Limited', 20, yPosition + 8)
  doc.text('Email: info@goldoak.co.ke | Phone: +254 729 911 311', 20, yPosition + 15)
  
  return doc
}
