import { useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

const PREBUILT_INSIGHTS = [
  {
    title: 'Robbery Pattern — Central District',
    category: 'Pattern Analysis',
    severity: 'Critical',
    content: `Coordinated robbery activity detected in Central District. 83% of incidents occur within 0.4km of 5th Avenue between 20:00–23:00 on weekdays. Suspect profile consistent across 4 linked cases. Recommend: surge patrol deployment during identified window.`,
    generated: '2024-06-10 08:00',
  },
  {
    title: 'Vehicle Theft Network — South District',
    category: 'Network Intelligence',
    severity: 'High',
    content: `ML clustering identified a vehicle theft network operating across South and East districts. 12 vehicles stolen share similar MO — targeted in parking lots near transit hubs. Possible chop-shop operation. Recommend: coordinate with traffic intelligence unit.`,
    generated: '2024-06-10 06:30',
  },
  {
    title: 'Officer Deployment Gap — South District',
    category: 'Resource Intelligence',
    severity: 'Medium',
    content: `South District is operating at 90% of required officer strength while recording a 9% crime increase. Clearance rate has dropped to 67% (state avg: 72.6%). Recommend: temporary reallocation of 10 officers from West District.`,
    generated: '2024-06-09 22:00',
  },
]

const SEV_STYLE = {
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  High:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Medium:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}

export default function SupervisorInsights() {
  const token   = useAuthStore((s) => s.token)
  const [query,   setQuery]   = useState('')
  const [loading, setLoading] = useState(false)
  const [custom,  setCustom]  = useState(null)
  const [stream,  setStream]  = useState('')

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!query.trim()) { toast.error('Enter a query.'); return }
    setLoading(true)
    setStream('')
    setCustom(null)

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query, chat_history: [] }),
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setStream(full)
      }

      setCustom({
        title: 'AI Strategic Insight',
        category: 'Custom Query',
        severity: 'High',
        content: full,
        generated: new Date().toLocaleString(),
      })
      setStream('')
      toast.success('AI insight generated.')
    } catch (err) {
      toast.error('Failed to generate insight. Check Groq API connection.')
    } finally {
      setLoading(false)
    }
  }

  const allInsights = custom ? [custom, ...PREBUILT_INSIGHTS] : PREBUILT_INSIGHTS

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="AI Insights"
        subtitle="AI-powered strategic intelligence for supervisors"
        action={<span className="badge bg-accent/15 text-accent-300 border border-accent/30 text-xs">AI Insights</span>}
      />

      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-3">Generate Custom Insight</p>
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="e.g. Analyze officer performance gaps in high-crime districts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-accent whitespace-nowrap">
            {loading ? <><Spinner size="sm" /> Generating…</> : 'Generate'}
          </button>
        </form>

        {loading && stream && (
          <div className="mt-4 p-4 rounded-lg bg-surface-300 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-2 font-semibold">Streaming response…</p>
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300">
              <ReactMarkdown>{stream}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {allInsights.map((insight, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">{insight.title}</p>
                  <span className={`badge border text-xs ${SEV_STYLE[insight.severity]}`}>{insight.severity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{insight.category}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs font-mono text-slate-600">{insight.generated}</span>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-300 border border-accent/20 font-mono">AI</span>
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300 leading-relaxed">
              <ReactMarkdown>{insight.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
