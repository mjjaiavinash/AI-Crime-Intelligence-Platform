import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

const TYPE_STYLE = {
  crime:    { dot: 'bg-accent',      label: 'text-accent-300' },
  response: { dot: 'bg-blue-500',    label: 'text-blue-400' },
  fir:      { dot: 'bg-primary-500', label: 'text-primary-300' },
  evidence: { dot: 'bg-purple-500',  label: 'text-purple-400' },
  suspect:  { dot: 'bg-orange-500',  label: 'text-orange-400' },
  note:     { dot: 'bg-slate-500',   label: 'text-slate-400' },
}

function parseTimelineText(text) {
  if (!text) return []
  return text.split('\n')
    .filter((l) => l.trim())
    .map((line, i) => {
      const typeMatch = ['evidence', 'suspect', 'fir', 'crime', 'note', 'response'].find((t) =>
        line.toLowerCase().includes(t)
      )
      return { id: i, text: line.trim(), type: typeMatch || 'note' }
    })
}

export default function InvestigatorTimeline() {
  const [firs,    setFirs]    = useState([])
  const [firId,   setFirId]   = useState('')
  const [loading, setLoading] = useState(false)
  const [events,  setEvents]  = useState([])
  const [count,   setCount]   = useState(0)

  useEffect(() => {
    api.get('/fir?page_size=50').then((r) => setFirs(r.data.items ?? []))
  }, [])

  const handleLoad = async (e) => {
    e.preventDefault()
    if (!firId) { toast.error('Select a FIR.'); return }
    setLoading(true)
    setEvents([])
    try {
      const { data } = await api.get(`/assistant/timeline/${firId}`)
      setEvents(parseTimelineText(data.timeline))
      setCount(data.raw_events_count ?? 0)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to load timeline.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Case Timeline" subtitle="AI-generated chronological event log" />

      <div className="card p-5">
        <form onSubmit={handleLoad} className="flex gap-3">
          <select className="input flex-1" value={firId} onChange={(e) => setFirId(e.target.value)} required>
            <option value="">Select a FIR to view timeline…</option>
            {firs.map((f) => (
              <option key={f.id} value={f.id}>{f.fir_number} — {f.title}</option>
            ))}
          </select>
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
            {loading ? <><Spinner size="sm" /> Loading…</> : 'Load Timeline'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : events.length > 0 ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50">
            <p className="text-sm font-semibold text-white">Case Timeline</p>
            <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 text-xs">{count} raw events</span>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700/50" />
            <div className="space-y-5">
              {events.map((ev) => {
                const style = TYPE_STYLE[ev.type] ?? TYPE_STYLE.note
                return (
                  <div key={ev.id} className="flex gap-4 pl-10 relative">
                    <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full ${style.dot} ring-2 ring-surface`} />
                    <div className="flex-1">
                      <span className={`text-xs font-semibold uppercase ${style.label} mr-2`}>{ev.type}</span>
                      <p className="text-sm text-slate-300 mt-0.5">{ev.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
