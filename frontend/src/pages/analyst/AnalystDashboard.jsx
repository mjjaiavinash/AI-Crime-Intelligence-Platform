import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import TrendLineChart from '@/components/charts/TrendLineChart'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import Spinner from '@/components/common/Spinner'
import EarlyWarningAlerts from '@/components/common/EarlyWarningAlerts'

export default function AnalystDashboard() {
  const [summary,  setSummary]  = useState(null)
  const [trends,   setTrends]   = useState([])
  const [byType,   setByType]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/trends'),
      api.get('/analytics/by-type'),
    ]).then(([s, t, b]) => {
      setSummary(s.data)
      setTrends(t.data)
      setByType(b.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Crime Analyst Dashboard"
        subtitle="Statistical overview and trend analysis"
        action={
          <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">
            Analytics Mode
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Crimes"       value={loading ? '…' : (summary?.total_crimes ?? 0)}         accent />
        <StatCard title="Open Cases"         value={loading ? '…' : (summary?.open_cases ?? 0)} />
        <StatCard title="Under Investigation"value={loading ? '…' : (summary?.under_investigation ?? 0)} />
        <StatCard title="Closed Cases"       value={loading ? '…' : (summary?.closed_cases ?? 0)} />
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner /></div>
        : (
          <div className="space-y-4">
            <EarlyWarningAlerts maxItems={3} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Monthly Crime Trend</p>
              <p className="text-xs text-slate-500 mb-4">{trends.length} months of data</p>
              {trends.length > 0
                ? <TrendLineChart data={trends} />
                : <p className="text-xs text-slate-500 text-center py-8">No trend data available</p>
              }
            </div>
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crime by Type</p>
              <p className="text-xs text-slate-500 mb-4">{byType.length} categories</p>
              {byType.length > 0
                ? <CrimeBarChart data={byType} />
                : <p className="text-xs text-slate-500 text-center py-8">No crime type data available</p>
              }
            </div>
          </div>
          </div>
        )
      }
    </div>
  )
}
