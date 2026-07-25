import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import Badge from '@/components/common/Badge'
import { cleanText, formatDate } from '@/utils/helpers'

export default function SupervisorResources() {
  const [firs,      setFirs]      = useState([])
  const [officers,  setOfficers]  = useState([])
  const [stations,  setStations]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [assigning, setAssigning] = useState(null) // fir id being updated

  useEffect(() => {
    Promise.allSettled([
      api.get('/fir?page_size=500'),
      api.get('/officers?page_size=200&is_active=true'),
      api.get('/police-stations?page_size=100'),
    ]).then(([f, o, s]) => {
      if (f.status === 'fulfilled') setFirs(f.value.data.items ?? [])
      if (o.status === 'fulfilled') setOfficers(o.value.data.items ?? [])
      if (s.status === 'fulfilled') setStations(s.value.data.items ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const handleAssign = async (firId, officerId) => {
    setAssigning(firId)
    try {
      await api.patch(`/fir/${firId}`, {
        io_officer_id: officerId ? Number(officerId) : null,
      })
      setFirs((prev) => prev.map((f) =>
        f.id === firId
          ? { ...f, io_officer_id: officerId ? Number(officerId) : null,
              io_officer: officers.find((o) => o.id === Number(officerId)) ?? null }
          : f
      ))
      toast.success('Officer assigned successfully.')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Assignment failed.')
    } finally {
      setAssigning(null)
    }
  }

  const activeOfficers = officers.filter((o) => o.is_active).length
  const assigned       = firs.filter((f) => f.io_officer_id).length
  const unassigned     = firs.filter((f) => !f.io_officer_id).length

  const filtered = firs
    .filter((f) => {
      if (filterStatus === 'assigned')   return !!f.io_officer_id
      if (filterStatus === 'unassigned') return !f.io_officer_id
      return true
    })
    .filter((f) => {
      const q = search.toLowerCase()
      return !q
        || f.fir_number?.toLowerCase().includes(q)
        || f.title?.toLowerCase().includes(q)
        || (f.io_officer?.user?.full_name ?? f.io_officer?.user?.username ?? '').toLowerCase().includes(q)
    })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Case Assignment" subtitle="Assign and reassign investigating officers to FIRs" />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total FIRs',       value: firs.length,     color: 'text-blue-400' },
              { label: 'Assigned',         value: assigned,        color: 'text-emerald-400' },
              { label: 'Unassigned',       value: unassigned,      color: 'text-red-400' },
              { label: 'Active Officers',  value: activeOfficers,  color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <p className="text-sm font-semibold text-white">FIR Case Assignments</p>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  className="input text-xs flex-1 sm:w-52"
                  placeholder="Search FIR no., title, officer…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="input text-xs w-36"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Cases</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['FIR No.', 'Title', 'Status', 'Station', 'Investigating Officer'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500 text-xs">No FIRs found.</td></tr>
                  ) : filtered.map((f) => (
                    <tr key={f.id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-amber-300 whitespace-nowrap">{f.fir_number}</td>
                      <td className="px-4 py-3 text-xs text-white max-w-[200px] truncate">{cleanText(f.title)}</td>
                      <td className="px-4 py-3">
                        <Badge label={f.status.replace(/_/g, ' ')} variant={f.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {stations.find((s) => s.id === f.station_id)?.name ?? `Station #${f.station_id}`}
                      </td>
                      <td className="px-4 py-3 min-w-[220px]">
                        {assigning === f.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <select
                            className="input text-xs py-1 px-2 h-auto"
                            value={f.io_officer_id ?? ''}
                            onChange={(e) => handleAssign(f.id, e.target.value || null)}
                          >
                            <option value="">— Unassigned —</option>
                            {officers.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.user?.full_name || o.user?.username} — {o.badge_number} ({o.rank})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
