import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Spinner from '@/components/common/Spinner'

const COLUMNS = [
  { key: 'district_id', label: 'District ID', render: (r) => <span className="font-mono text-primary-300">#{r.district_id}</span> },
  { key: 'stations',    label: 'Stations',    render: (r) => <span className="font-medium text-white">{r.stations}</span> },
  { key: 'names',       label: 'Station Names',render: (r) => <span className="text-slate-400 text-xs">{r.names}</span> },
]

export default function AdminDistricts() {
  const [districts, setDistricts] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    api.get('/police-stations?page_size=100').then((r) => {
      const items = r.data.items ?? []
      // Group stations by district_id
      const map = {}
      items.forEach((s) => {
        if (!map[s.district_id]) map[s.district_id] = []
        map[s.district_id].push(s.name)
      })
      const rows = Object.entries(map).map(([did, names]) => ({
        district_id: Number(did),
        stations:    names.length,
        names:       names.join(', '),
      })).sort((a, b) => a.district_id - b.district_id)
      setDistricts(rows)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="District Management"
        subtitle="Districts derived from police station assignments"
        action={!loading && <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{districts.length} districts</span>}
      />
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-white">All Districts</p>
        </div>
        {loading
          ? <div className="flex justify-center py-12"><Spinner /></div>
          : <Table columns={COLUMNS} data={districts} loading={false} />
        }
      </div>
    </div>
  )
}
