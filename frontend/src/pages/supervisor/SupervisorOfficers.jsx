import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import Spinner from '@/components/common/Spinner'

const RANK_COLOR = {
  inspector:       'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'sub-inspector': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  constable:       'bg-slate-500/15 text-slate-300 border-slate-500/30',
  'head constable':'bg-purple-500/15 text-purple-300 border-purple-500/30',
  dsp:             'bg-amber-500/15 text-amber-300 border-amber-500/30',
  sp:              'bg-red-500/15 text-red-300 border-red-500/30',
}

function rankStyle(rank) {
  const key = (rank ?? '').toLowerCase()
  return RANK_COLOR[key] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/30'
}

function ClearanceBadge({ rate }) {
  if (rate >= 70) return <span className="text-xs font-semibold text-emerald-400">{rate}%</span>
  if (rate >= 40) return <span className="text-xs font-semibold text-yellow-400">{rate}%</span>
  return <span className="text-xs font-semibold text-red-400">{rate}%</span>
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-400 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-4 text-right">{value}</span>
    </div>
  )
}

export default function SupervisorOfficers() {
  const [officers,  setOfficers]  = useState([])
  const [firs,      setFirs]      = useState([])
  const [stations,  setStations]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    Promise.allSettled([
      api.get('/officers?page_size=200'),
      api.get('/fir?page_size=500'),
      api.get('/police-stations?page_size=100'),
    ]).then(([o, f, s]) => {
      if (o.status === 'fulfilled') setOfficers(o.value.data.items ?? [])
      if (f.status === 'fulfilled') setFirs(f.value.data.items ?? [])
      if (s.status === 'fulfilled') setStations(s.value.data.items ?? [])
    }).finally(() => setLoading(false))
  }, [])

  // compute per-officer stats from FIR data
  const officersWithStats = officers.map((o) => {
    const assigned = firs.filter((f) => f.io_officer_id === o.id)
    const closed   = assigned.filter((f) => f.status === 'closed_true' || f.status === 'closed_false' || f.status === 'charge_sheet_filed' || f.status === 'referred_to_court')
    const open     = assigned.filter((f) => f.status === 'filed' || f.status === 'under_investigation')
    const rate     = assigned.length > 0 ? Math.round((closed.length / assigned.length) * 100) : 0
    return { ...o, totalCases: assigned.length, closedCases: closed.length, openCases: open.length, clearanceRate: rate }
  })

  const active   = officers.filter((o) => o.is_active).length
  const maxCases = Math.max(...officersWithStats.map((o) => o.totalCases), 1)

  const filtered = officersWithStats
    .filter((o) => filterStatus === 'all' ? true : filterStatus === 'active' ? o.is_active : !o.is_active)
    .filter((o) => {
      const q = search.toLowerCase()
      return !q || (o.user?.full_name ?? o.user?.username ?? '').toLowerCase().includes(q)
        || o.badge_number.toLowerCase().includes(q)
        || (o.station?.name ?? '').toLowerCase().includes(q)
    })
    .sort((a, b) => b.totalCases - a.totalCases)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Officer Performance"
        subtitle="Workload, case assignments and clearance rates"
        action={
          <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs">
            {officers.length} Officers
          </span>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Officers"  value={loading ? '…' : officers.length} accent />
        <StatCard title="Active"          value={loading ? '…' : active} />
        <StatCard title="Inactive"        value={loading ? '…' : officers.length - active} />
        <StatCard title="Stations"        value={loading ? '…' : stations.length} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="card overflow-hidden">
          {/* toolbar */}
          <div className="px-5 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <p className="text-sm font-semibold text-white">Officer Registry</p>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                className="input text-xs flex-1 sm:w-48"
                placeholder="Search name, badge, station…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="input text-xs w-32 pr-8"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Officer', 'Badge', 'Rank', 'Station', 'Total Cases', 'Open', 'Closed', 'Clearance', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-500 text-xs">No officers found.</td></tr>
                ) : filtered.map((o) => (
                  <tr key={o.id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {(o.user?.full_name ?? o.user?.username ?? '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{o.user?.full_name || o.user?.username || '—'}</p>
                          <p className="text-[10px] text-slate-500">{o.department || 'General'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-300">{o.badge_number}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border text-[10px] capitalize ${rankStyle(o.rank)}`}>{o.rank}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{o.station?.name || `Station #${o.station_id}`}</td>
                    <td className="px-4 py-3">
                      <MiniBar value={o.totalCases} max={maxCases} color="bg-blue-500" />
                    </td>
                    <td className="px-4 py-3 text-xs text-yellow-400 font-semibold">{o.openCases}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400 font-semibold">{o.closedCases}</td>
                    <td className="px-4 py-3"><ClearanceBadge rate={o.clearanceRate} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${o.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {o.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
