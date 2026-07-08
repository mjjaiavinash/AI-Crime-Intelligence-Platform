import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import EmptyState from '@/components/common/EmptyState'

const SAMPLE_REPORT = `## Intelligence Summary — Downtown Robbery Cluster

**Classification:** RESTRICTED  
**Generated:** ${new Date().toLocaleString()}  
**Analyst:** AI System (Groq LLaMA-3 + RAG)

---

### Executive Summary
Analysis of 12 robbery incidents in the Downtown sector between January–June 2024 reveals a coordinated pattern consistent with an organized group operating primarily on weekday evenings (20:00–23:00).

### Key Findings
- **Pattern:** 83% of incidents occurred within a 0.4km radius of 5th Avenue
- **MO:** Suspects approach on foot, target lone pedestrians near ATMs
- **Suspect Profile:** 2–3 individuals, aged 20–30, dark clothing
- **Linked Cases:** IDs #1, #4, #7, #11 share identical suspect descriptions

### Recommended Actions
1. Increase patrol density in Downtown sector 20:00–23:00
2. Review CCTV footage from 5th Ave ATM clusters
3. Cross-reference suspect descriptions with existing database

### Risk Assessment
**Threat Level: HIGH** — Pattern suggests escalation risk if not disrupted within 30 days.`

export default function ReportsPage() {
  const [query, setQuery]       = useState('')
  const [title, setTitle]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [report, setReport]     = useState(null)
  const [history, setHistory]   = useState([])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!query.trim()) { toast.error('Enter a query to generate a report.'); return }
    setLoading(true)
    // Simulate API call — replace with: await generateReport({ title, query })
    await new Promise((r) => setTimeout(r, 2000))
    const newReport = { id: Date.now(), title: title || 'Intelligence Report', content: SAMPLE_REPORT, createdAt: new Date() }
    setReport(newReport)
    setHistory((h) => [newReport, ...h])
    toast.success('Report generated successfully.')
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AI Intelligence Reports"
        subtitle="Generate natural-language reports using Groq LLM + RAG"
        action={
          <span className="badge bg-accent/15 text-accent-300 border border-accent/30 text-xs">
            Powered by Groq
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold text-white mb-4">Generate Report</p>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Report Title
                </label>
                <input className="input" placeholder="e.g. Downtown Robbery Analysis"
                  value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Intelligence Query
                </label>
                <textarea className="input resize-none" rows={5}
                  placeholder="e.g. Analyze robbery patterns in the downtown sector and identify suspect connections..."
                  value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-accent w-full">
                {loading ? <><Spinner size="sm" /> Generating…</> : '⚡ Generate Report'}
              </button>
            </form>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Recent Reports
              </p>
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

        {/* Report viewer */}
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
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generated {report.createdAt.toLocaleString()}
                  </p>
                </div>
                <button className="btn-ghost text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
                  {report.content}
                </pre>
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
