import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import { cleanText } from '@/utils/helpers'
import jsPDF from 'jspdf'

const SIMILAR_MOCK = [
  { fir: 'KA-BLR-2023-0412', title: 'Armed Robbery — MG Road', similarity: 94, outcome: 'Convicted', duration: '4 months' },
  { fir: 'KA-MYS-2022-1187', title: 'Gang Assault — City Market', similarity: 81, outcome: 'Acquitted', duration: '7 months' },
  { fir: 'KA-BLR-2023-0891', title: 'Theft with Violence — Koramangala', similarity: 73, outcome: 'Convicted', duration: '3 months' },
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-300 transition-colors px-2 py-1 rounded border border-slate-700/50 hover:border-primary-500/30">
      {copied
        ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
        : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
      }
    </button>
  )
}

export default function InvestigatorAssistant() {
  const [firs,        setFirs]        = useState([])
  const [firId,       setFirId]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [firsLoading, setFirsLoading] = useState(true)
  const [result,      setResult]      = useState(null)
  const [similarOpen, setSimilarOpen] = useState(false)
  const summaryRef = useRef(null)

  const handleExportPDF = () => {
    if (!result) return
    toast.loading('Generating PDF…', { id: 'pdf' })
    try {
      const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const mL = 15, mR = 15, mT = 28, mB = 18
      const maxW = pageW - mL - mR
      let y = mT

      const checkPage = (needed = 7) => {
        if (y + needed > pageH - mB) { pdf.addPage(); y = mT }
      }

      // Header
      pdf.setFillColor(10, 15, 30)
      pdf.rect(0, 0, pageW, 20, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      pdf.setTextColor(255, 255, 255)
      pdf.text('Karnataka State Police — AI Case Intelligence', mL, 13)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.text(`FIR: ${result.fir_number}   |   Generated: ${new Date().toLocaleString()}`, pageW - mR, 13, { align: 'right' })

      // Title
      pdf.setTextColor(20, 20, 20)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      const titleLines = pdf.splitTextToSize(`Case Summary: ${result.fir_number}`, maxW)
      pdf.text(titleLines, mL, y)
      y += titleLines.length * 7 + 2
      pdf.setDrawColor(99, 102, 241)
      pdf.setLineWidth(0.4)
      pdf.line(mL, y, pageW - mR, y)
      y += 5

      const renderInline = (text, x, startY, fontSize, color, indentW = 0) => {
        pdf.setFontSize(fontSize)
        pdf.setTextColor(...color)
        const lineH  = fontSize * 0.42
        const availW = maxW - indentW
        const parts  = text.split(/\*\*(.+?)\*\*/g)
        const tokens = []
        parts.forEach((p, i) => {
          if (p === '') return
          const bold = i % 2 === 1
          p.split(' ').forEach((word, wi) => tokens.push({ word: (wi === 0 ? '' : ' ') + word, bold }))
        })
        let curX = x, curY = startY
        tokens.forEach(({ word, bold }) => {
          pdf.setFont('helvetica', bold ? 'bold' : 'normal')
          const ww = pdf.getTextWidth(word)
          if (curX + ww > x + availW && curX !== x) {
            curY += lineH; checkPage(lineH); curX = x; word = word.trimStart()
          }
          pdf.text(word, curX, curY)
          curX += pdf.getTextWidth(word)
        })
        return curY + lineH
      }

      const lines = result.summary.split('\n')
      for (const raw of lines) {
        const line = raw.trimEnd()
        if (/^# /.test(line)) {
          checkPage(10); y += 3
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(20, 20, 20)
          const w = pdf.splitTextToSize(line.replace(/^# /, ''), maxW)
          pdf.text(w, mL, y); y += w.length * 6.5 + 1
          pdf.setDrawColor(99, 102, 241); pdf.setLineWidth(0.3); pdf.line(mL, y, pageW - mR, y); y += 4
          continue
        }
        if (/^## /.test(line)) {
          checkPage(9); y += 2
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(30, 30, 30)
          const w = pdf.splitTextToSize(line.replace(/^## /, ''), maxW)
          pdf.text(w, mL, y); y += w.length * 6 + 3
          continue
        }
        if (/^### /.test(line)) {
          checkPage(8); y += 1
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(50, 50, 50)
          const w = pdf.splitTextToSize(line.replace(/^### /, ''), maxW)
          pdf.text(w, mL, y); y += w.length * 5.5 + 2
          continue
        }
        if (/^#### /.test(line)) {
          checkPage(7); y += 1
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(60, 60, 60)
          const w = pdf.splitTextToSize(line.replace(/^#### /, ''), maxW)
          pdf.text(w, mL, y); y += w.length * 5 + 2
          continue
        }
        if (/^---+$/.test(line.trim())) {
          checkPage(4)
          pdf.setDrawColor(180, 180, 180); pdf.setLineWidth(0.2); pdf.line(mL, y, pageW - mR, y); y += 4
          continue
        }
        if (/^[\*\-] /.test(line)) {
          checkPage(6)
          pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(40, 40, 40)
          pdf.text('•', mL + 1, y)
          y = renderInline(line.replace(/^[\*\-] /, ''), mL + 6, y, 9, [40, 40, 40], 6)
          y += 1.5; continue
        }
        if (/^\d+\.\s/.test(line)) {
          checkPage(6)
          const num  = line.match(/^(\d+\.)/)[1]
          const text = line.replace(/^\d+\.\s/, '')
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(40, 40, 40)
          pdf.text(num, mL + 1, y)
          y = renderInline(text, mL + 8, y, 9, [40, 40, 40], 8)
          y += 1.5; continue
        }
        if (line.trim() === '') { y += 2; continue }
        checkPage(6)
        y = renderInline(line, mL, y, 9, [40, 40, 40])
        y += 1.5
      }

      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(150, 150, 150)
        pdf.text(`CONFIDENTIAL — Karnataka State Police Intelligence Platform | Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' })
      }

      pdf.save(`${result.fir_number}-case-summary.pdf`)
      toast.success('PDF exported', { id: 'pdf' })
    } catch (e) {
      console.error(e)
      toast.error('PDF export failed', { id: 'pdf' })
    }
  }

  useEffect(() => {
    api.get('/fir?page_size=100')
      .then((r) => setFirs(r.data.items ?? []))
      .catch(() => toast.error('Failed to load FIR list. Is the backend running?'))
      .finally(() => setFirsLoading(false))
  }, [])

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!firId) { toast.error('Select a FIR to analyze.'); return }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.get(`/assistant/case-summary/${firId}`)
      setResult(data)
      toast.success('AI case summary generated.')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'AI assistant failed. Check Groq API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AI Investigation Assistant"
        subtitle="AI-powered case intelligence summaries"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card p-5 space-y-4">
          <p className="text-sm font-semibold text-white">Analyze a Case</p>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Select FIR</label>
              <select className="input" value={firId} onChange={(e) => setFirId(e.target.value)} required>
                <option value="">
                  {firsLoading ? 'Loading FIRs…' : firs.length === 0 ? 'No FIRs found in database' : 'Choose a case…'}
                </option>
                {firs.map((f) => (
                  <option key={f.id} value={f.id}>{f.fir_number} — {cleanText(f.title)}</option>
                ))}
              </select>
              {!firsLoading && firs.length === 0 && (
                <p className="text-xs text-amber-400 mt-1.5">⚠ No FIRs in database. File a FIR first from the FIR Management page.</p>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-accent w-full">
              {loading ? <><Spinner size="sm" /> Analyzing…</> : 'Generate Summary'}
            </button>
          </form>

          {result && (
            <div className="space-y-3 pt-2 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Confidence</p>
                <p className="text-sm font-bold text-success">{Math.round((result.confidence_score ?? 0) * 100)}%</p>
              </div>
              <div className="h-1.5 bg-surface-400 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${Math.round((result.confidence_score ?? 0) * 100)}%` }} />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(result.supporting_sources ?? []).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded bg-surface-300 text-slate-400 border border-slate-700/50">{s.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card p-6 min-h-80">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Spinner size="lg" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Analyzing case data…</p>
                <p className="text-xs text-slate-500 mt-1">Groq LLM processing victims, suspects, evidence</p>
              </div>
            </div>
          ) : result ? (
            <div className="animate-fade-in" ref={summaryRef}>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700/50">
                <div>
                  <p className="text-base font-semibold text-white">{result.fir_number}</p>
                  <p className="text-xs text-slate-500 mt-0.5">AI Case Intelligence Summary</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <CopyButton text={result.summary} />
                  <button onClick={handleExportPDF} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-300 transition-colors px-2 py-1 rounded border border-slate-700/50 hover:border-primary-500/30">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export PDF
                  </button>
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-300 border border-accent/20 font-mono">AI</span>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
                prose-p:text-slate-300 prose-p:leading-relaxed
                prose-li:text-slate-300 prose-li:leading-relaxed
                prose-strong:text-white prose-strong:font-semibold
                prose-hr:border-slate-700">
                <ReactMarkdown>{result.summary}</ReactMarkdown>
              </div>

              {/* Similar Past Cases */}
              <div className="mt-5 pt-4 border-t border-slate-700/50">
                <button
                  onClick={() => setSimilarOpen((v) => !v)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3"
                >
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Similar Past Cases
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[10px] font-bold">{SIMILAR_MOCK.length}</span>
                  <svg className={`w-3 h-3 ml-auto transition-transform ${similarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {similarOpen && (
                  <div className="space-y-2">
                    {SIMILAR_MOCK.map((c) => (
                      <div key={c.fir} className="flex items-center gap-3 bg-surface-400 rounded-lg px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-primary-300">{c.fir}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                              c.outcome === 'Convicted' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
                            }`}>{c.outcome}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 truncate">{c.title}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">Resolved in {c.duration}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-500">Similarity</p>
                          <p className={`text-sm font-bold ${
                            c.similarity >= 90 ? 'text-emerald-400' : c.similarity >= 75 ? 'text-yellow-400' : 'text-slate-300'
                          }`}>{c.similarity}%</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-600 px-1">Matched by crime type, location pattern, and modus operandi similarity.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg className="w-10 h-10 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm text-slate-500">Select a FIR and click Generate Summary</p>
              <p className="text-xs text-slate-600 mt-1">AI will analyze all linked suspects, victims, and evidence</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
