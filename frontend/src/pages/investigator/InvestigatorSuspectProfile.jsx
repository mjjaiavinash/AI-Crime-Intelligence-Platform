import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

const THREAT_COLOR = {
  extreme: { badge: 'bg-red-500/15 text-red-400 border-red-500/30',    bar: 'bg-red-500',    ring: 'ring-red-500/30' },
  high:    { badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', bar: 'bg-orange-500', ring: 'ring-orange-500/30' },
  medium:  { badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-500', ring: 'ring-yellow-500/30' },
  low:     { badge: 'bg-green-500/15 text-green-400 border-green-500/30',    bar: 'bg-green-500',  ring: 'ring-green-500/30' },
}

const STATUS_COLOR = {
  at_large:   'text-accent-400',
  arrested:   'text-success',
  bailed:     'text-yellow-400',
  absconding: 'text-red-400',
  deceased:   'text-slate-500',
}

function RiskMeter({ score, label }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 75 ? 'bg-red-500' : pct >= 50 ? 'bg-orange-500' : pct >= 25 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{pct}<span className="text-slate-500">/100</span></span>
      </div>
      <div className="h-2 bg-surface-400 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function InvestigatorSuspectProfile() {
  const [suspects,   setSuspects]   = useState([])
  const [suspectId,  setSuspectId]  = useState('')
  const [profile,    setProfile]    = useState(null)
  const [mlRisk,     setMlRisk]     = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [loadingML,  setLoadingML]  = useState(false)

  useEffect(() => {
    api.get('/suspects?page_size=100').then((r) => setSuspects(r.data.items ?? []))
  }, [])

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!suspectId) { toast.error('Select a suspect.'); return }
    setProfile(null)
    setMlRisk(null)
    setLoading(true)
    setLoadingML(true)

    // Run AI profile and ML risk score in parallel
    api.get(`/assistant/suspect-profile/${suspectId}`)
      .then((r) => setProfile(r.data))
      .catch(() => toast.error('AI profiling failed. Check Groq API.'))
      .finally(() => setLoading(false))

    api.get(`/ml/risk-score/${suspectId}`)
      .then((r) => setMlRisk(r.data))
      .catch(() => setMlRisk(null))   // non-critical
      .finally(() => setLoadingML(false))
  }

  const selected = suspects.find((s) => String(s.id) === String(suspectId))
  const threat   = selected?.threat_level ?? 'low'
  const tStyle   = THREAT_COLOR[threat] ?? THREAT_COLOR.low

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Suspect Profiling"
        subtitle="AI behavioral analysis and ML recidivism risk scoring"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left panel — selector + ML scores */}
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-sm font-semibold text-white mb-4">Select Suspect</p>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <select className="input" value={suspectId} onChange={(e) => setSuspectId(e.target.value)} required>
                <option value="">Choose a suspect…</option>
                {suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || 'Unknown'}{s.alias ? ` (${s.alias})` : ''}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="btn-accent w-full">
                {loading ? <><Spinner size="sm" /> Profiling…</> : 'Generate Profile'}
              </button>
            </form>
          </div>

          {/* Suspect quick-info card */}
          {selected && (
            <div className={`card p-5 ring-1 ${tStyle.ring} space-y-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{selected.full_name || 'Unknown'}</p>
                  {selected.alias && <p className="text-xs text-slate-500">aka {selected.alias}</p>}
                </div>
                <span className={`badge border text-xs capitalize ${tStyle.badge}`}>{threat}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  ['Gender',  selected.gender ?? '—'],
                  ['Age',     selected.age_estimated ?? '—'],
                  ['Status',  selected.arrest_status?.replace('_', ' ') ?? '—'],
                  ['Gang',    selected.gang_affiliation ?? 'None'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-slate-500">{k}</p>
                    <p className={`font-medium capitalize ${k === 'Status' ? (STATUS_COLOR[selected.arrest_status] ?? 'text-white') : 'text-white'}`}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ML Risk Scores */}
          {(loadingML || mlRisk) && (
            <div className="card p-5 space-y-4">
              <p className="text-sm font-semibold text-white">ML Risk Scores</p>
              {loadingML
                ? <div className="flex justify-center py-4"><Spinner /></div>
                : (
                  <>
                    <RiskMeter score={Math.round((mlRisk?.recidivism_probability ?? 0) * 100)} label="Recidivism Probability" />
                    <RiskMeter score={mlRisk?.threat_score ?? 0} label="Threat Score" />
                    {mlRisk?.risk_classification && (
                      <div className="pt-1">
                        <p className="text-xs text-slate-500 mb-1">Classification</p>
                        <span className={`badge border text-xs capitalize ${THREAT_COLOR[mlRisk.risk_classification?.toLowerCase()] ? THREAT_COLOR[mlRisk.risk_classification?.toLowerCase()].badge : 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}>
                          {mlRisk.risk_classification}
                        </span>
                      </div>
                    )}
                    {mlRisk?.prior_offenses !== undefined && (
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-700/50">
                        <span className="text-slate-500">Prior Offenses</span>
                        <span className="font-bold text-white">{mlRisk.prior_offenses}</span>
                      </div>
                    )}
                  </>
                )
              }
            </div>
          )}
        </div>

        {/* Right panel — AI profiling analysis */}
        <div className="lg:col-span-2 card p-6 min-h-96">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Spinner size="lg" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Generating behavioral profile…</p>
                <p className="text-xs text-slate-500 mt-1">Groq LLM analyzing criminal history, gang links, threat flags</p>
              </div>
            </div>
          ) : profile ? (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50">
                <div>
                  <p className="text-base font-semibold text-white">{profile.full_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">AI Criminological Profile · Suspect #{profile.suspect_id}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-300 border border-accent/20 font-mono">AI</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
                prose-p:text-slate-300 prose-p:leading-relaxed
                prose-li:text-slate-300 prose-li:leading-relaxed
                prose-strong:text-white prose-strong:font-semibold
                prose-hr:border-slate-700">
                <ReactMarkdown>{profile.profiling_analysis}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg className="w-10 h-10 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-sm text-slate-500">Select a suspect and click Generate Profile</p>
              <p className="text-xs text-slate-600 mt-1">AI will analyze criminal history, gang affiliations, and recidivism risk</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
