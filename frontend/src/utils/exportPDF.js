import jsPDF from 'jspdf'

/**
 * Export chat conversation history to a PDF file.
 * @param {Array} messages - Array of { role, content } objects
 * @param {string} title - PDF title
 */
export function exportChatToPDF(messages, title = 'CrimeIQ Chat Export') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW  = doc.internal.pageSize.getWidth()
  const pageH  = doc.internal.pageSize.getHeight()
  const margin = 15
  const maxW   = pageW - margin * 2
  let y = margin

  const addPage = () => {
    doc.addPage()
    y = margin
  }

  const checkY = (needed = 10) => {
    if (y + needed > pageH - margin) addPage()
  }

  // Header
  doc.setFillColor(10, 15, 30)
  doc.rect(0, 0, pageW, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('CrimeIQ Intelligence Platform', margin, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleString(), pageW - margin, 13, { align: 'right' })

  y = 28

  // Title
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin, y)
  y += 8

  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageW - margin, y)
  y += 6

  // Messages
  messages.forEach((msg) => {
    const isUser = msg.role === 'user'

    checkY(14)

    // Role label
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(isUser ? 37 : 16, isUser ? 99 : 185, isUser ? 235 : 129)
    doc.text(isUser ? 'YOU' : 'CRIMEIQ AI', margin, y)
    y += 5

    // Message content
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)

    const lines = doc.splitTextToSize(msg.content, maxW)
    lines.forEach((line) => {
      checkY(5)
      doc.text(line, margin, y)
      y += 5
    })

    y += 4
    doc.setDrawColor(230, 230, 230)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  })

  // Footer on each page
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(`RESTRICTED — Law Enforcement Use Only | Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' })
  }

  doc.save(`CrimeIQ_Chat_${Date.now()}.pdf`)
}

/**
 * Export a text report to PDF.
 */
export function exportReportToPDF(title, content, generatedAt = new Date().toLocaleString()) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW  = doc.internal.pageSize.getWidth()
  const pageH  = doc.internal.pageSize.getHeight()
  const margin = 15
  const maxW   = pageW - margin * 2
  let y = margin

  const checkY = (needed = 10) => {
    if (y + needed > pageH - margin) { doc.addPage(); y = margin }
  }

  // Header bar
  doc.setFillColor(10, 15, 30)
  doc.rect(0, 0, pageW, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('CrimeIQ Intelligence Platform', margin, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(generatedAt, pageW - margin, 13, { align: 'right' })

  y = 28

  // Title
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin, y)
  y += 8

  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageW - margin, y)
  y += 7

  // Content
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(40, 40, 40)

  const lines = doc.splitTextToSize(content, maxW)
  lines.forEach((line) => {
    checkY(5)
    doc.text(line, margin, y)
    y += 5
  })

  // Footer
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(`RESTRICTED — Law Enforcement Use Only | Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' })
  }

  doc.save(`CrimeIQ_Report_${Date.now()}.pdf`)
}
