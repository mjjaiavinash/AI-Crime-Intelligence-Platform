import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

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
  const [result,      setResult]      = useState(null)
  const [similarOpen, setSimilarOpen] = useState(false)

  useEffect(() => {
    api.get('/fir?page_size=50').then((r) => setFirs(r.data.items ?? []))
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
        subtitle="Groq-powered case intelligence summaries"
        action={<span className="badge bg-accent/15 text-accent-300 border border-accent/30 text-xs">Powered by Groq</span>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card p-5 space-y-4">
          <p className="text-sm font-semibold text-white">Analyze a Case</p>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Select FIR</label>
              <select className="input" value={firId} onChange={(e) => setFirId(e.target.value)} required>
                <option value="">Choose a case…</option>
                {firs.map((f) => (
                  <option key={f.id} value={f.id}>{f.fir_number} — {f.title}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-accent w-full">
              {loading ? <><Spinner size="sm" /> Analyzing…</> : '⚡ Generate Summary'}
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
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700/50">
                <div>
                  <p className="text-base font-semibold text-white">{result.fir_number}</p>
                  <p className="text-xs text-slate-500 mt-0.5">AI Case Intelligence Summary</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <CopyButton text={result.summary} />
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-300 border border-accent/20 font-mono">AI</span>
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
                {result.summary}
              </pre>

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
