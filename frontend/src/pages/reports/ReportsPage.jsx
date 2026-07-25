import { useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import EmptyState from '@/components/common/EmptyState'
import { exportReportToPDF } from '@/utils/exportPDF'

export default function ReportsPage() {
  const [query,   setQuery]   = useState('')
  const [title,   setTitle]   = useState('')
  const [loading, setLoading] = useState(false)
  const [report,  setReport]  = useState(null)
  const [history, setHistory] = useState([])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!query.trim()) { toast.error('Enter a query to generate a report.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/reports', {
        title: title || 'Intelligence Report',
        query,
        crime_ids: [],
      })
      const newReport = { id: data.id, title: data.title, content: data.content, createdAt: new Date(data.created_at) }
      setReport(newReport)
      setHistory((h) => [newReport, ...h])
      toast.success('Report generated successfully.')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Report generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AI Intelligence Reports"
        subtitle="Generate natural-language reports using Groq LLM + RAG"
        action={<span className="badge bg-accent/15 text-accent-300 border border-accent/30 text-xs">Powered by Groq</span>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold text-white mb-4">Generate Report</p>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Report Title</label>
                <input className="input" placeholder="e.g. Downtown Robbery Analysis"
                  value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Intelligence Query</label>
                <textarea className="input resize-none" rows={5}
                  placeholder="e.g. Analyze robbery patterns in the downtown sector and identify suspect connections..."
                  value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-accent w-full">
                {loading ? <><Spinner size="sm" /> Generating…</> : '⚡ Generate Report'}
              </button>
            </form>
          </div>

          {history.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Reports</p>
              <ul className="space-y-2">
                {history.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => setReport(r)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors
                        ${report?.id === r.id
                          ? 'bg-primary-500/20 text-white border border-primary-500/30'
                          : 'text-slate-400 hover:bg-surface-300 hover:text-white'}`}>
                      <p className="font-medium truncate">{r.title}</p>
                      <p className="text-slate-600 mt-0.5">{r.createdAt.toLocaleTimeString()}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 card p-6 min-h-96">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Spinner size="lg" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Generating intelligence report…</p>
                <p className="text-xs text-slate-500 mt-1">Querying RAG context and Groq LLM</p>
              </div>
            </div>
          ) : report ? (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50">
                <div>
                  <p className="text-base font-semibold text-white">{report.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Generated {report.createdAt.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    exportReportToPDF(report.title, report.content, report.createdAt.toLocaleString())
                    toast.success('Report exported as PDF.')
                  }}
                  className="btn-ghost text-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PDF
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
                prose-h4:text-sm prose-h4:mt-4 prose-h4:mb-1
                prose-p:text-slate-300 prose-p:leading-relaxed
                prose-li:text-slate-300 prose-li:leading-relaxed
                prose-strong:text-white prose-strong:font-semibold
                prose-hr:border-slate-700">
                <ReactMarkdown>{report.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              title="No report generated yet"
              description="Enter a query and click Generate Report to create an AI-powered intelligence report."
            />
          )}
        </div>
      </div>
    </div>
  )
}
