import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import TrendLineChart from '@/components/charts/TrendLineChart'
import Spinner from '@/components/common/Spinner'

const RISK_COLOR = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Low:      'text-green-400 bg-green-500/10 border-green-500/30',
}

function riskFromCount(count) {
  if (count >= 10) return 'Critical'
  if (count >= 6)  return 'High'
  if (count >= 3)  return 'Medium'
  return 'Low'
}

// Simple linear extrapolation for next 3 months
function buildForecast(trends) {
  if (trends.length < 2) return trends
  const last = trends[trends.length - 1]
  const prev = trends[trends.length - 2]
  const delta = last.total - prev.total
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const lastMonthIdx = months.indexOf(last.month?.slice(0, 3))
  const forecast = [...trends]
  for (let i = 1; i <= 3; i++) {
    const monthIdx = (lastMonthIdx + i) % 12
    forecast.push({
      month:      months[monthIdx] + ' (est)',
      total:      Math.max(0, Math.round(last.total + delta * i * 0.8)),
      forecasted: true,
    })
  }
  return forecast
}

export default function AnalystForecasting() {
  const [trends,   setTrends]   = useState([])
  const [hotspots, setHotspots] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/trends'),
      api.get('/ml/hotspots').catch(() => ({ data: [] })),
    ]).then(([t, h]) => {
      setTrends(t.data ?? [])
      setHotspots(Array.isArray(h.data) ? h.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const forecast = buildForecast(trends)

  const predictions = hotspots.slice(0, 4).map((h, i) => ({
    zone:   `Cluster #${i + 1} (${h.center_lat?.toFixed(3) ?? h.lat?.toFixed(3)}, ${h.center_lng?.toFixed(3) ?? h.lng?.toFixed(3)})`,
    risk:   riskFromCount(h.count ?? h.size ?? 0),
    next30: h.count ?? h.size ?? 0,
  }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Crime Forecasting"
        subtitle="Trend extrapolation and ML-based predictions"
        action={<span className="badge bg-accent/15 text-accent-300 border border-accent/30 text-xs">ML Powered</span>}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {forecast.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crime Trend + 3-Month Forecast</p>
              <p className="text-xs text-slate-500 mb-4">
                {trends.length} months historical · 3 months extrapolated
              </p>
              <TrendLineChart data={forecast} />
            </div>
          )}

          {predictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map(({ zone, risk, next30 }) => (
                <div key={zone} className="card p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{zone}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Incidents in cluster: <span className="text-white font-mono">{next30}</span>
                    </p>
                  </div>
                  <span className={`badge border text-xs ${RISK_COLOR[risk]}`}>{risk}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-slate-500 text-sm">
              No ML hotspot data available. Add FIR records with coordinates to enable spatial forecasting.
            </div>
          )}
        </>
      )}
    </div>
  )
}
