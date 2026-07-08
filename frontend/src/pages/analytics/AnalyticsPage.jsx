import PageHeader from '@/components/common/PageHeader'
import TrendLineChart from '@/components/charts/TrendLineChart'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const TRENDS = [
  { month: 'Jan', total: 42 }, { month: 'Feb', total: 38 }, { month: 'Mar', total: 55 },
  { month: 'Apr', total: 47 }, { month: 'May', total: 61 }, { month: 'Jun', total: 53 },
  { month: 'Jul', total: 70 }, { month: 'Aug', total: 65 }, { month: 'Sep', total: 58 },
]

const BY_TYPE = [
  { crime_type: 'theft',    total: 34 }, { crime_type: 'robbery',  total: 21 },
  { crime_type: 'assault',  total: 18 }, { crime_type: 'fraud',    total: 14 },
  { crime_type: 'homicide', total: 5  }, { crime_type: 'other',    total: 9  },
]

const STATUS_DATA = [
  { name: 'Open',               value: 84,  color: '#e63946' },
  { name: 'Under Investigation', value: 34,  color: '#f59e0b' },
  { name: 'Closed',             value: 178, color: '#10b981' },
]

const HOTSPOTS = [
  { zone: 'Downtown',   count: 48, pct: 82 },
  { zone: 'Midtown',    count: 35, pct: 60 },
  { zone: 'East Side',  count: 27, pct: 46 },
  { zone: 'Uptown',     count: 19, pct: 33 },
  { zone: 'West End',   count: 12, pct: 21 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Crime Analytics"
        subtitle="Statistical breakdown and trend analysis"
      />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Avg Response Time', value: '8.4 min', delta: '-12%', good: true },
          { label: 'Case Clearance Rate', value: '60.1%', delta: '+4%', good: true },
          { label: 'Repeat Offender Rate', value: '23%', delta: '+2%', good: false },
        ].map(({ label, value, delta, good }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className={`text-xs mt-1 font-semibold ${good ? 'text-success' : 'text-accent-400'}`}>{delta} vs last quarter</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-white mb-1">9-Month Crime Trend</p>
          <p className="text-xs text-slate-500 mb-4">Total incidents per month</p>
          <TrendLineChart data={TRENDS} />
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Case Status</p>
          <p className="text-xs text-slate-500 mb-4">Current case distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" paddingAngle={3}>
                {STATUS_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#cbd5e1' }}
              />
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Incidents by Type</p>
          <p className="text-xs text-slate-500 mb-4">Crime category breakdown</p>
          <CrimeBarChart data={BY_TYPE} />
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Crime Hotspots</p>
          <p className="text-xs text-slate-500 mb-4">Top zones by incident count</p>
          <div className="space-y-3 mt-2">
            {HOTSPOTS.map(({ zone, count, pct }) => (
              <div key={zone}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{zone}</span>
                  <span className="text-slate-500">{count} incidents</span>
                </div>
                <div className="h-1.5 bg-surface-400 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-accent rounded-full
                                  transition-all duration-700"
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network graph placeholder */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-1">Suspect Network Graph</p>
        <p className="text-xs text-slate-500 mb-4">Crime-suspect relationship visualization (Cytoscape.js)</p>
        <div className="h-48 rounded-lg bg-surface-300 border border-slate-700/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🕸️</div>
            <p className="text-sm text-slate-400 font-medium">Network Graph</p>
            <p className="text-xs text-slate-600 mt-1">Connect backend to render live graph</p>
          </div>
        </div>
      </div>
    </div>
  )
}
