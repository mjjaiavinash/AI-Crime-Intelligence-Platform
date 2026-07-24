import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import TrendLineChart from '@/components/charts/TrendLineChart'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import StatCard from '@/components/common/StatCard'
import Spinner from '@/components/common/Spinner'

export default function AnalystTrends() {
  const [trends,  setTrends]  = useState([])
  const [byType,  setByType]  = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/trends'),
      api.get('/analytics/by-type'),
      api.get('/analytics/summary'),
    ]).then(([t, b, s]) => {
      setTrends(t.data ?? [])
      setByType(b.data ?? [])
      setSummary(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const peak = trends.reduce((max, t) => t.total > (max?.total ?? 0) ? t : max, null)
  const avg  = trends.length ? Math.round(trends.reduce((s, t) => s + t.total, 0) / trends.length) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Crime Trends"
        subtitle="Monthly crime volume and category analysis"
        action={<span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">Trend Analysis</span>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Crimes"    value={loading ? '…' : (summary?.total_crimes ?? 0)} accent />
        <StatCard title="Months of Data"  value={loading ? '…' : trends.length} />
        <StatCard title="Monthly Average" value={loading ? '…' : avg} />
        <StatCard title="Peak Month"      value={loading ? '…' : (peak?.month ?? '—')} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="card p-5">
            <p className="text-sm font-semibold text-white mb-1">Monthly Crime Trend</p>
            <p className="text-xs text-slate-500 mb-4">{trends.length} months of historical data</p>
            {trends.length > 0
              ? <TrendLineChart data={trends} />
              : <p className="text-xs text-slate-500 text-center py-8">No trend data available yet.</p>
            }
          </div>

          {byType.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crimes by Category</p>
              <p className="text-xs text-slate-500 mb-4">{byType.length} crime types recorded</p>
              <CrimeBarChart data={byType} />
            </div>
          )}

          {trends.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-white">Monthly Breakdown</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['Month', 'Incidents', 'vs Average'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...trends].reverse().map((t) => {
                    const diff = t.total - avg
                    return (
                      <tr key={t.month} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                        <td className="px-5 py-3 font-mono text-slate-300">{t.month}</td>
                        <td className="px-5 py-3 font-bold text-white">{t.total}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold ${diff > 0 ? 'text-accent-400' : diff < 0 ? 'text-success' : 'text-slate-500'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
