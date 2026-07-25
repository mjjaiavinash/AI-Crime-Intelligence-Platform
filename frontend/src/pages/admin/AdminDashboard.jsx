import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'

const COLUMNS = [
  { key: 'id',        label: '#',       render: (r) => <span className="font-mono text-slate-500">#{r.id}</span> },
  { key: 'username',  label: 'Username', render: (r) => <span className="font-medium text-white">{r.username}</span> },
  { key: 'full_name', label: 'Name',     render: (r) => <span className="text-slate-300">{r.full_name || '—'}</span> },
  { key: 'role',      label: 'Role',     render: (r) => <Badge label={r.role} variant={r.role} /> },
  { key: 'is_active', label: 'Status',   render: (r) => (
    <span className={`badge ${r.is_active ? 'bg-success/15 text-emerald-300 border border-success/30' : 'bg-slate-700/50 text-slate-500 border border-slate-600/50'}`}>
      {r.is_active ? 'Active' : 'Inactive'}
    </span>
  )},
]

export default function AdminDashboard() {
  const [users,   setUsers]   = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([
      api.get('/auth/users'),
      api.get('/analytics/summary'),
    ]).then(([u, s]) => {
      setUsers(u.data)
      setSummary(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const active = users.filter((u) => u.is_active).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Admin Dashboard" subtitle="System overview and user management" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users"  value={loading ? '…' : users.length}                    accent />
        <StatCard title="Active Users" value={loading ? '…' : active} />
        <StatCard title="Total Crimes" value={loading ? '…' : (summary?.total_crimes ?? '…')} />
        <StatCard title="Open Cases"   value={loading ? '…' : (summary?.open_cases ?? '…')} />
      </div>

<div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">System Users</p>
            <p className="text-xs text-slate-500 mt-0.5">All registered platform users</p>
          </div>
          {!loading && <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{users.length} users</span>}
        </div>
        <Table columns={COLUMNS} data={users} loading={loading} emptyMessage="No users registered yet." />
      </div>
    </div>
  )
}
