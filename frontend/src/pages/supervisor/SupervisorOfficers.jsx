import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import StatCard from '@/components/common/StatCard'
import Spinner from '@/components/common/Spinner'

const COLUMNS = [
  { key: 'badge_number', label: 'Badge',    render: (r) => <span className="font-mono text-xs text-primary-300">{r.badge_number}</span> },
  { key: 'rank',         label: 'Rank',     render: (r) => <span className="text-slate-300 capitalize">{r.rank}</span> },
  { key: 'user',         label: 'Officer',  render: (r) => <span className="font-medium text-white">{r.user?.full_name || r.user?.username || '—'}</span> },
  { key: 'department',   label: 'Dept',     render: (r) => <span className="text-slate-400 text-xs">{r.department || '—'}</span> },
  { key: 'station',      label: 'Station',  render: (r) => <span className="text-slate-400 text-xs">{r.station?.name || `Station #${r.station_id}`}</span> },
  { key: 'is_active',    label: 'Status',   render: (r) => (
    <span className={`text-xs font-semibold ${r.is_active ? 'text-success' : 'text-slate-500'}`}>
      {r.is_active ? 'Active' : 'Inactive'}
    </span>
  )},
]

export default function SupervisorOfficers() {
  const [officers, setOfficers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [total,    setTotal]    = useState(0)

  useEffect(() => {
    api.get('/officers?page_size=100')
      .then((r) => { setOfficers(r.data.items ?? []); setTotal(r.data.total ?? 0) })
      .finally(() => setLoading(false))
  }, [])

  const active = officers.filter((o) => o.is_active).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Officer Management" subtitle="All registered officers" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Officers" value={loading ? '…' : total}  accent />
        <StatCard title="Active"         value={loading ? '…' : active} />
        <StatCard title="Inactive"       value={loading ? '…' : total - active} />
        <StatCard title="Stations"       value="—" />
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Officer Registry</p>
          {!loading && <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30">{total} officers</span>}
        </div>
        {loading
          ? <div className="flex justify-center py-12"><Spinner /></div>
          : <Table columns={COLUMNS} data={officers} loading={false} />
        }
      </div>
    </div>
  )
}
