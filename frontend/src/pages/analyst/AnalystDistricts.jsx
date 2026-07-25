import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts'

const STATUS_COLORS = {
  open_cases:          '#facc15',
  under_investigation: '#60a5fa',
  closed_cases:        '#34d399',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs space-y-1">
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  )
}

export default function AnalystDistricts() {
  const [districts, setDistricts] = useState([])
  const [byType,    setByType]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/by-district'),
      api.get('/analytics/by-type'),
    ]).then(([d, b]) => {
      setDistricts(d.data ?? [])
      setByType(b.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const totalCrimes = districts.reduce((s, d) => s + d.total, 0)
  const totalOpen   = districts.reduce((s, d) => s + d.open_cases, 0)
  const totalClosed = districts.reduce((s, d) => s + d.closed_cases, 0)
  const totalInvest = districts.reduce((s, d) => s + d.under_investigation, 0)

  // short name for chart axis
  const chartData = districts.map((d) => ({
    name: d.district_name.replace(' Urban', '').replace(' Rural', ''),
    open_cases:          d.open_cases,
    under_investigation: d.under_investigation,
    closed_cases:        d.closed_cases,
    total:               d.total,
  }))

  const typeChartData = byType.map((b) => ({ name: b.crime_type, total: b.total }))

  const TYPE_COLORS = ['#60a5fa','#f472b6','#34d399','#facc15','#fb923c','#a78bfa','#f87171','#38bdf8']

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="District Analytics"
        subtitle="Crime statistics and breakdown by district"
        action={
          !loading && (
            <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">
              {districts.length} districts
            </span>
          )
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Crimes',        value: totalCrimes, color: 'text-accent-300'   },
              { label: 'Open Cases',          value: totalOpen,   color: 'text-yellow-400'   },
              { label: 'Under Investigation', value: totalInvest, color: 'text-blue-400'     },
              { label: 'Closed Cases',        value: totalClosed, color: 'text-emerald-400'  },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Stacked bar — crimes per district */}
          {chartData.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crimes per District</p>
              <p className="text-xs text-slate-500 mb-4">Breakdown by case status</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    angle={-35} textAnchor="end" interval={0}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,58,95,0.2)' }} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }}
                    formatter={(v) => v.replace('_', ' ')}
                  />
                  <Bar dataKey="open_cases"          stackId="a" fill={STATUS_COLORS.open_cases}          name="Open Cases" radius={[0,0,0,0]} />
                  <Bar dataKey="under_investigation" stackId="a" fill={STATUS_COLORS.under_investigation} name="Under Investigation" />
                  <Bar dataKey="closed_cases"        stackId="a" fill={STATUS_COLORS.closed_cases}        name="Closed Cases" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Crime type distribution */}
          {typeChartData.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crime Type Distribution</p>
              <p className="text-xs text-slate-500 mb-4">Incidents by category across all districts</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,58,95,0.2)' }} />
                  <Bar dataKey="total" radius={[4,4,0,0]}>
                    {typeChartData.map((_, i) => (
                      <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* District table */}
          {districts.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-white">District Breakdown</p>
                <p className="text-xs text-slate-500 mt-0.5">Click a row to highlight</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['District', 'Total', 'Open', 'Investigating', 'Closed', 'Share'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {districts.map((d) => {
                    const share = totalCrimes > 0 ? ((d.total / totalCrimes) * 100).toFixed(1) : 0
                    const isSelected = selected === d.district_id
                    return (
                      <tr
                        key={d.district_id}
                        onClick={() => setSelected(isSelected ? null : d.district_id)}
                        className={`border-b border-slate-700/30 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-500/10' : 'hover:bg-surface-300/50'
                        }`}
                      >
                        <td className="px-5 py-3 font-semibold text-white">{d.district_name}</td>
                        <td className="px-5 py-3 font-mono text-accent-300 font-bold">{d.total}</td>
                        <td className="px-5 py-3 font-mono text-yellow-400">{d.open_cases}</td>
                        <td className="px-5 py-3 font-mono text-blue-400">{d.under_investigation}</td>
                        <td className="px-5 py-3 font-mono text-emerald-400">{d.closed_cases}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-8">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {districts.length === 0 && (
            <div className="card p-10 text-center text-slate-500 text-sm">
              No district data available. Add FIRs with district assignments to see analytics.
            </div>
          )}
        </>
      )}
    </div>
  )
}
