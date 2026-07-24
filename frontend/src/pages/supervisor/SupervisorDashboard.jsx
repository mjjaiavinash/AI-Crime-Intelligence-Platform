import { useEffect, useState } from 'react'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import TrendLineChart from '@/components/charts/TrendLineChart'
import Spinner from '@/components/common/Spinner'
import EarlyWarningAlerts from '@/components/common/EarlyWarningAlerts'

const RISK_COLOR = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Low:      'text-green-400 bg-green-500/10 border-green-500/30',
}

function riskLevel(count) {
  if (count >= 50) return 'Critical'
  if (count >= 30) return 'High'
  if (count >= 15) return 'Medium'
  return 'Low'
}

export default function SupervisorDashboard() {
  const user = useAuthStore((s) => s.user)
  const [summary,  setSummary]  = useState(null)
  const [trends,   setTrends]   = useState([])
  const [stations, setStations] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/trends'),
      api.get('/police-stations?page_size=50'),
      api.get('/analytics/by-station').catch(() => ({ data: [] })),
    ]).then(([s, t, ps, bs]) => {
      setSummary(s.data)
      setTrends(t.data)
      const counts = Array.isArray(bs.data)
        ? Object.fromEntries(bs.data.map((x) => [x.station_id ?? x.id, x.count ?? x.total ?? 0]))
        : {}
      setStations((ps.data.items ?? []).map((st) => ({ ...st, _crimeCount: counts[st.id] ?? 0 })))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome, ${user?.full_name ?? user?.username ?? 'Supervisor'}`}
        subtitle="State-level crime intelligence overview"
        action={
          <div className="flex items-center gap-2 text-xs font-mono text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
            LIVE
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Crimes"        value={loading ? '…' : (summary?.total_crimes ?? 0)}         accent />
        <StatCard title="Open Cases"          value={loading ? '…' : (summary?.open_cases ?? 0)} />
        <StatCard title="Under Investigation" value={loading ? '…' : (summary?.under_investigation ?? 0)} />
        <StatCard title="Closed Cases"        value={loading ? '…' : (summary?.closed_cases ?? 0)} />
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner /></div>
        : <>
          <EarlyWarningAlerts />

          {trends.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">State Crime Trend</p>
              <p className="text-xs text-slate-500 mb-4">Monthly incidents across all stations</p>
              <TrendLineChart data={trends} />
            </div>
          )}

          {stations.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-white">Police Stations Overview</p>
                <p className="text-xs text-slate-500 mt-0.5">{stations.length} stations registered</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      {['Station', 'Code', 'District', 'Crimes', 'Status', 'Risk'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((s) => {
                      const risk = riskLevel(s._crimeCount)
                      return (
                        <tr key={s.id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-white">{s.name}</td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-400">{s.station_code}</td>
                          <td className="px-5 py-3 text-slate-300">{s.district_id}</td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-300">{s._crimeCount}</td>
                          <td className="px-5 py-3">
                            <span className={`badge border text-xs ${s.is_active !== false ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-slate-500 bg-slate-700/50 border-slate-600/50'}`}>
                              {s.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`badge border text-xs ${RISK_COLOR[risk]}`}>{risk}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      }
    </div>
  )
}
