import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Spinner from '@/components/common/Spinner'

const SEV_COLOR = {
  critical: 'text-red-400', high: 'text-orange-400',
  medium:   'text-yellow-400', low: 'text-green-400',
}

const COLUMNS = [
  { key: 'id',       label: '#',        render: (r) => <span className="font-mono text-slate-500">#{r.id}</span> },
  { key: 'code',     label: 'Code',     render: (r) => <span className="font-mono text-xs bg-surface-300 px-2 py-0.5 rounded text-slate-300">{r.code || '—'}</span> },
  { key: 'name',     label: 'Type',     render: (r) => <span className="font-medium text-white">{r.name}</span> },
  { key: 'category', label: 'Category', render: (r) => <span className="capitalize text-slate-400 text-xs">{r.category || '—'}</span> },
  { key: 'severity', label: 'Severity', render: (r) => <span className={`font-semibold text-xs capitalize ${SEV_COLOR[r.severity?.toLowerCase()] ?? 'text-slate-400'}`}>{r.severity || '—'}</span> },
]

export default function AdminCrimeTypes() {
  const [types,   setTypes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [total,   setTotal]   = useState(0)

  useEffect(() => {
    api.get('/crime-types?page_size=100')
      .then((r) => { setTypes(r.data.items ?? []); setTotal(r.data.total ?? 0) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Crime Types"
        subtitle="Manage crime categories and severity levels"
        action={<span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{total} types</span>}
      />
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-white">Crime Categories</p>
        </div>
        {loading
          ? <div className="flex justify-center py-12"><Spinner /></div>
          : <Table columns={COLUMNS} data={types} loading={false} />
        }
      </div>
    </div>
  )
}
