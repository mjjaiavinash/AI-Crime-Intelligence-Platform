import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Spinner from '@/components/common/Spinner'

const COLUMNS = [
  { key: 'id',           label: '#',       render: (r) => <span className="font-mono text-slate-500">#{r.id}</span> },
  { key: 'station_code', label: 'Code',    render: (r) => <span className="font-mono text-xs bg-surface-300 px-2 py-0.5 rounded text-slate-300">{r.station_code}</span> },
  { key: 'name',         label: 'Station', render: (r) => <span className="font-medium text-white">{r.name}</span> },
  { key: 'district_id',  label: 'District',render: (r) => <span className="text-slate-400">District #{r.district_id}</span> },
  { key: 'phone',        label: 'Phone',   render: (r) => <span className="font-mono text-xs text-slate-400">{r.phone || '—'}</span> },
  { key: 'is_active',    label: 'Status',  render: (r) => (
    <span className={`text-xs font-semibold ${r.is_active !== false ? 'text-success' : 'text-slate-500'}`}>
      {r.is_active !== false ? 'Active' : 'Inactive'}
    </span>
  )},
]

export default function AdminStations() {
  const [stations, setStations] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [total,    setTotal]    = useState(0)

  useEffect(() => {
    api.get('/police-stations?page_size=100')
      .then((r) => { setStations(r.data.items ?? []); setTotal(r.data.total ?? 0) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Police Stations"
        subtitle="Manage police stations across all districts"
        action={<span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{total} stations</span>}
      />
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-white">All Stations</p>
        </div>
        {loading
          ? <div className="flex justify-center py-12"><Spinner /></div>
          : <Table columns={COLUMNS} data={stations} loading={false} />
        }
      </div>
    </div>
  )
}
