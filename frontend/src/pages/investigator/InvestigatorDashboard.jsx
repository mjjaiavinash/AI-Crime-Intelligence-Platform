import { useEffect, useState } from 'react'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import { formatDate, cleanText } from '@/utils/helpers'

const COLUMNS = [
  { key: 'fir_number',   label: 'FIR No.',  render: (r) => <span className="font-mono text-xs text-primary-300">{r.fir_number}</span> },
  { key: 'title',        label: 'Case',     render: (r) => <span className="font-medium text-white">{cleanText(r.title)}</span> },
  { key: 'incident_date',label: 'Date',     render: (r) => formatDate(r.incident_date) },
  { key: 'location_name',label: 'Location', render: (r) => <span className="text-slate-400 text-xs">{r.location_name || '—'}</span> },
  { key: 'status',       label: 'Status',   render: (r) => <Badge label={r.status.replace(/_/g, ' ')} variant={r.status} /> },
]

export default function InvestigatorDashboard() {
  const user = useAuthStore((s) => s.user)
  const [firs,    setFirs]    = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/fir?page_size=5'),
      api.get('/analytics/summary'),
    ]).then(([f, s]) => {
      setFirs(f.data.items ?? [])
      setSummary(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const open   = firs.filter((f) => f.status === 'filed').length
  const active = firs.filter((f) => f.status === 'under_investigation').length
  const closed = firs.filter((f) => f.status.startsWith('closed')).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome, ${user?.full_name ?? user?.username ?? 'Investigator'}`}
        subtitle="Your active cases and investigation overview"
        action={
          <div className="flex items-center gap-2 text-xs font-mono text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
            ON DUTY
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total FIRs"          value={loading ? '…' : (summary?.total_crimes ?? firs.length)} accent />
        <StatCard title="Filed"               value={loading ? '…' : open} />
        <StatCard title="Under Investigation" value={loading ? '…' : active} />
        <StatCard title="Closed"              value={loading ? '…' : closed} />
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-white">Recent FIRs</p>
          <p className="text-xs text-slate-500 mt-0.5">Latest 5 filed cases</p>
        </div>
        <Table columns={COLUMNS} data={firs} loading={loading} emptyMessage="No FIRs filed yet. File your first case." />
      </div>
    </div>
  )
}
