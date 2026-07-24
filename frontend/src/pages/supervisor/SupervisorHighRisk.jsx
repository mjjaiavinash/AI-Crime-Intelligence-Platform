import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

const RISK_STYLE = {
  Critical: { badge: 'bg-red-500/15 text-red-400 border-red-500/30',    bar: 'bg-red-500',    ring: 'ring-red-500/30' },
  High:     { badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30', bar: 'bg-orange-500', ring: 'ring-orange-500/30' },
  Medium:   { badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-500', ring: 'ring-yellow-500/30' },
}

function riskFromCount(count) {
  if (count >= 10) return 'Critical'
  if (count >= 5)  return 'High'
  return 'Medium'
}

export default function SupervisorHighRisk() {
  const [hotspots, setHotspots] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/ml/hotspots').catch(() => ({ data: [] })),
      api.get('/analytics/hotspots').catch(() => ({ data: [] })),
    ]).then(([ml, analytics]) => {
      const mlData = Array.isArray(ml.data) ? ml.data : []
      const analyticsData = Array.isArray(analytics.data) ? analytics.data : []
      // Prefer ML hotspots, fall back to analytics hotspots
      const source = mlData.length > 0 ? mlData : analyticsData.map((h) => ({
        center_lat: h.lat, center_lng: h.lng, count: h.count, size: h.count,
      }))
      setHotspots(source.filter((h) => (h.count ?? h.size ?? 0) > 0)
        .sort((a, b) => (b.count ?? b.size ?? 0) - (a.count ?? a.size ?? 0))
        .slice(0, 6))
    }).finally(() => setLoading(false))
  }, [])

  const alerts = hotspots.filter((h) => riskFromCount(h.count ?? h.size ?? 0) !== 'Medium')

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="High Risk Zones"
        subtitle="ML-detected hotspots requiring immediate attention"
        action={
          !loading && (
            <span className="badge bg-red-500/15 text-red-400 border border-red-500/30 text-xs animate-pulse">
              ⚠ {alerts.length} ALERTS
            </span>
          )
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : hotspots.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm">
          No high-risk zones detected. Add FIR data with coordinates to enable ML hotspot analysis.
        </div>
      ) : (
        <div className="space-y-4">
          {hotspots.map((h, i) => {
            const count = h.count ?? h.size ?? 0
            const risk  = riskFromCount(count)
            const style = RISK_STYLE[risk] ?? RISK_STYLE.Medium
            const score = Math.min(99, Math.round(count * 8 + 20))
            const lat   = (h.center_lat ?? h.lat ?? 0).toFixed(4)
            const lng   = (h.center_lng ?? h.lng ?? 0).toFixed(4)

            return (
              <div key={i} className={`card p-5 ring-1 ${style.ring}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-base font-semibold text-white">Hotspot Cluster #{i + 1}</p>
                      <span className={`badge border text-xs ${style.badge}`}>{risk}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-500">
                      {lat}, {lng} · {count} incidents
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                    <p className="text-2xl font-bold text-white">{score}<span className="text-sm text-slate-500">/100</span></p>
                  </div>
                </div>

                <div className="h-1.5 bg-surface-400 rounded-full overflow-hidden mb-4">
                  <div className={`h-full ${style.bar} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
                </div>

                <div className="flex items-start gap-2 bg-surface-300 rounded-lg px-3 py-2">
                  <span className="text-yellow-400 text-xs mt-0.5">⚠</span>
                  <p className="text-xs text-slate-300">
                    {risk === 'Critical'
                      ? `High-density crime cluster detected. Recommend immediate surge patrol deployment in this zone.`
                      : `Elevated crime activity detected. Monitor closely and consider increased patrol frequency.`
                    }
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
