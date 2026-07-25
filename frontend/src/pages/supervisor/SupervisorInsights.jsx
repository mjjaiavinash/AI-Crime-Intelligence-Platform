import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

const SEV_STYLE = {
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  high:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  medium:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}

const TYPE_LABEL = {
  repeat:  'Repeat Offender',
  hotspot: 'Crime Hotspot',
  gang:    'Gang Activity',
  pattern: 'Pattern Alert',
}

export default function SupervisorInsights() {
  const token = useAuthStore((s) => s.token)
  const [alerts,  setAlerts]  = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [stream,  setStream]  = useState('')
  const [custom,  setCustom]  = useState(null)

  useEffect(() => {
    api.get('/analytics/alerts')
      .then((r) => setAlerts(r.data ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!query.trim()) { toast.error('Enter a query.'); return }
    setAiLoading(true)
    setStream('')
    setCustom(null)
    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query, chat_history: [] }),
      })
      if (!res.ok) throw new Error()
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStream(full)
      }
      setCustom({ title: 'AI Strategic Insight', category: 'Custom Query', severity: 'high', content: full, generated: new Date().toLocaleString() })
      setStream('')
      toast.success('AI insight generated.')
    } catch {
      toast.error('Failed to generate insight. Check Groq API connection.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AI Insights"
        subtitle="Real-time alerts and AI-powered strategic intelligence"
        action={<span className="badge bg-accent/15 text-accent-300 border border-accent/30 text-xs">Live Alerts</span>}
      />

      {/* Custom AI query */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-3">Generate Custom Insight</p>
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="e.g. Analyze officer performance gaps in high-crime districts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={aiLoading} className="btn-accent whitespace-nowrap">
            {aiLoading ? <><Spinner size="sm" /> Generating…</> : 'Generate'}
          </button>
        </form>
        {aiLoading && stream && (
          <div className="mt-4 p-4 rounded-lg bg-surface-300 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-2 font-semibold">Streaming response…</p>
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300">
              <ReactMarkdown>{stream}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Custom AI result */}
      {custom && (
        <div className="card p-5 space-y-3 border border-accent/20">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white">{custom.title}</p>
                <span className={`badge border text-xs ${SEV_STYLE[custom.severity]}`}>{custom.severity}</span>
              </div>
              <span className="text-xs font-mono text-slate-600">{custom.generated}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-300 border border-accent/20 font-mono">AI</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300">
            <ReactMarkdown>{custom.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Real alerts */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Early Warning Alerts — Live DB</p>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : alerts.length === 0 ? (
          <div className="card p-8 text-center space-y-2">
            <p className="text-sm text-slate-400 font-medium">No active alerts</p>
            <p className="text-xs text-slate-600">Alerts are generated when repeat offenders, crime hotspots, or gang activity are detected in the database.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="card p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{alert.title}</p>
                      <span className={`badge border text-xs capitalize ${SEV_STYLE[alert.severity] ?? SEV_STYLE.medium}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{TYPE_LABEL[alert.type] ?? alert.type}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{alert.district}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs font-mono text-slate-600">{alert.time}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{alert.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
