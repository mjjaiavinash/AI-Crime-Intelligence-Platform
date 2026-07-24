import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import TrendLineChart from '@/components/charts/TrendLineChart'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import Spinner from '@/components/common/Spinner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PIE_COLORS = ['#e63946', '#f59e0b', '#10b981']

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [trends,  setTrends]  = useState([])
  const [byType,  setByType]  = useState([])
  const [loading, setLoading] = useState(true)

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

  const pieData = summary ? [
    { name: 'Open',               value: summary.open_cases,          color: PIE_COLORS[0] },
    { name: 'Under Investigation',value: summary.under_investigation,  color: PIE_COLORS[1] },
    { name: 'Closed',             value: summary.closed_cases,         color: PIE_COLORS[2] },
  ] : []

  if (loading) return (
    <div className="flex justify-center items-center h-64"><Spinner /></div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Crime Analytics" subtitle="Statistical breakdown and trend analysis" />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Crimes',         value: summary?.total_crimes ?? 0,         color: 'text-white' },
          { label: 'Open Cases',           value: summary?.open_cases ?? 0,           color: 'text-accent-300' },
          { label: 'Under Investigation',  value: summary?.under_investigation ?? 0,  color: 'text-yellow-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-white mb-1">Monthly Crime Trend</p>
          <p className="text-xs text-slate-500 mb-4">{trends.length} months of data</p>
          {trends.length > 0
            ? <TrendLineChart data={trends} />
            : <p className="text-xs text-slate-500 text-center py-8">No trend data available</p>
          }
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Case Status</p>
          <p className="text-xs text-slate-500 mb-4">Current distribution</p>
          {pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} itemStyle={{ color: '#cbd5e1' }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-slate-500 text-center py-8">No case data</p>}
        </div>
      </div>

      {byType.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Incidents by Type</p>
          <p className="text-xs text-slate-500 mb-4">{byType.length} categories</p>
          <CrimeBarChart data={byType} />
        </div>
      )}
    </div>
  )
}
