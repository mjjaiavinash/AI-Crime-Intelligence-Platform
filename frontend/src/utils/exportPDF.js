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
  const doc    = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW  = doc.internal.pageSize.getWidth()
  const pageH  = doc.internal.pageSize.getHeight()
  const mL = 15, mR = 15, mT = 28, mB = 18
  const maxW = pageW - mL - mR
  let y = mT

  const checkY = (needed = 7) => {
    if (y + needed > pageH - mB) { doc.addPage(); y = mT }
  }

  // Header bar
  doc.setFillColor(10, 15, 30)
  doc.rect(0, 0, pageW, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Karnataka State Police — Intelligence Platform', mL, 13)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(generatedAt, pageW - mR, 13, { align: 'right' })

  // Report title
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(title, maxW)
  doc.text(titleLines, mL, y)
  y += titleLines.length * 7 + 2
  doc.setDrawColor(99, 102, 241)
  doc.setLineWidth(0.4)
  doc.line(mL, y, pageW - mR, y)
  y += 5

  // Inline bold renderer
  const renderInline = (text, x, startY, fontSize, color, indentW = 0) => {
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    const lineH  = fontSize * 0.42
    const availW = maxW - indentW
    const parts  = text.split(/\*\*(.+?)\*\*/g)
    const tokens = []
    parts.forEach((p, i) => {
      if (p === '') return
      const bold = i % 2 === 1
      p.split(' ').forEach((word, wi) => {
        tokens.push({ word: (wi === 0 ? '' : ' ') + word, bold })
      })
    })
    let curX = x, curY = startY
    tokens.forEach(({ word, bold }) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      const ww = doc.getTextWidth(word)
      if (curX + ww > x + availW && curX !== x) {
        curY += lineH; checkY(lineH); curX = x; word = word.trimStart()
      }
      doc.text(word, curX, curY)
      curX += doc.getTextWidth(word)
    })
    return curY + lineH
  }

  // Parse markdown
  const lines = content.split('\n')
  for (const raw of lines) {
    const line = raw.trimEnd()

    if (/^# /.test(line)) {
      checkY(10); y += 3
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(20, 20, 20)
      const w = doc.splitTextToSize(line.replace(/^# /, ''), maxW)
      doc.text(w, mL, y); y += w.length * 6.5 + 1
      doc.setDrawColor(99, 102, 241); doc.setLineWidth(0.3); doc.line(mL, y, pageW - mR, y); y += 4
      continue
    }
    if (/^## /.test(line)) {
      checkY(9); y += 2
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(30, 30, 30)
      const w = doc.splitTextToSize(line.replace(/^## /, ''), maxW)
      doc.text(w, mL, y); y += w.length * 6 + 3
      continue
    }
    if (/^### /.test(line)) {
      checkY(8); y += 1
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(50, 50, 50)
      const w = doc.splitTextToSize(line.replace(/^### /, ''), maxW)
      doc.text(w, mL, y); y += w.length * 5.5 + 2
      continue
    }
    if (/^#### /.test(line)) {
      checkY(7); y += 1
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(60, 60, 60)
      const w = doc.splitTextToSize(line.replace(/^#### /, ''), maxW)
      doc.text(w, mL, y); y += w.length * 5 + 2
      continue
    }
    if (/^##### /.test(line)) {
      checkY(6)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(70, 70, 70)
      const w = doc.splitTextToSize(line.replace(/^##### /, ''), maxW)
      doc.text(w, mL, y); y += w.length * 5 + 1.5
      continue
    }
    if (/^---+$/.test(line.trim())) {
      checkY(4)
      doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.2); doc.line(mL, y, pageW - mR, y); y += 4
      continue
    }
    if (/^[\*\-] /.test(line)) {
      checkY(6)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 40, 40)
      doc.text('•', mL + 1, y)
      y = renderInline(line.replace(/^[\*\-] /, ''), mL + 6, y, 9, [40, 40, 40], 6)
      y += 1.5
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      checkY(6)
      const num  = line.match(/^(\d+\.)/)[1]
      const text = line.replace(/^\d+\.\s/, '')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(40, 40, 40)
      doc.text(num, mL + 1, y)
      y = renderInline(text, mL + 8, y, 9, [40, 40, 40], 8)
      y += 1.5
      continue
    }
    if (line.trim() === '') { y += 2; continue }

    checkY(6)
    y = renderInline(line, mL, y, 9, [40, 40, 40])
    y += 1.5
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7); doc.setTextColor(150, 150, 150)
    doc.text(`CONFIDENTIAL — Karnataka State Police | Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' })
  }

  doc.save(`CrimeIQ_Report_${Date.now()}.pdf`)
}
