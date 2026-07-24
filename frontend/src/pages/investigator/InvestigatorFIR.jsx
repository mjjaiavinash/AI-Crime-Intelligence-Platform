import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import Spinner from '@/components/common/Spinner'
import { formatDate, cleanText } from '@/utils/helpers'

const COLUMNS = [
  { key: 'fir_number',   label: 'FIR No.',  render: (r) => <span className="font-mono text-xs text-primary-300">{r.fir_number}</span> },
  { key: 'title',        label: 'Title',    render: (r) => <span className="font-medium text-white">{cleanText(r.title)}</span> },
  { key: 'incident_date',label: 'Incident', render: (r) => formatDate(r.incident_date) },
  { key: 'location_name',label: 'Location', render: (r) => <span className="text-slate-400 text-xs">{r.location_name || '—'}</span> },
  { key: 'status',       label: 'Status',   render: (r) => <Badge label={r.status.replace(/_/g, ' ')} variant={r.status} /> },
]

const EMPTY = { title: '', description: '', fir_number: '', station_id: '', district_id: '', crime_type_id: '', incident_date: '', location_name: '' }
const PAGE_SIZE = 20

export default function InvestigatorFIR() {
  const [firs,       setFirs]       = useState([])
  const [stations,   setStations]   = useState([])
  const [crimeTypes, setCrimeTypes] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [open,       setOpen]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [total,      setTotal]      = useState(0)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/fir?page=${page}&page_size=${PAGE_SIZE}`),
      api.get('/police-stations?page_size=100'),
      api.get('/crime-types?page_size=100'),
    ]).then(([f, s, c]) => {
      setFirs(f.data.items ?? [])
      setTotal(f.data.total ?? 0)
      setStations(s.data.items ?? [])
      setCrimeTypes(c.data.items ?? [])
    }).finally(() => setLoading(false))
  }, [page])

  const filtered = search.trim()
    ? firs.filter((r) =>
        r.fir_number?.toLowerCase().includes(search.toLowerCase()) ||
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.location_name?.toLowerCase().includes(search.toLowerCase())
      )
    : firs

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.station_id || !form.crime_type_id || !form.fir_number || !form.incident_date) {
      toast.error('Fill all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const now = new Date().toISOString()
      const station = stations.find((s) => s.id === Number(form.station_id))
      const payload = {
        fir_number:    form.fir_number,
        title:         form.title,
        description:   form.description,
        station_id:    Number(form.station_id),
        district_id:   station?.district_id ?? 1,
        crime_type_id: Number(form.crime_type_id),
        incident_date: new Date(form.incident_date).toISOString(),
        reported_date: now,
        location_name: form.location_name || null,
        status:        'filed',
      }
      const { data } = await api.post('/fir', payload)
      setFirs((p) => [data, ...p])
      setTotal((t) => t + 1)
      toast.success(`FIR ${data.fir_number} filed successfully.`)
      setOpen(false)
      setForm(EMPTY)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to file FIR.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="FIR Management"
        subtitle="First Information Reports"
        action={<button onClick={() => setOpen(true)} className="btn-primary">+ File FIR</button>}
      />
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-4">
          <p className="text-sm font-semibold text-white shrink-0">All FIRs</p>
          <input
            className="input text-sm py-1.5 flex-1 max-w-xs"
            placeholder="Search FIR no., title, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 shrink-0 ml-auto">{total} records</span>
        </div>
        {loading
          ? <div className="flex justify-center py-12"><Spinner /></div>
          : <Table columns={COLUMNS} data={filtered} loading={false} />
        }
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs disabled:opacity-40">← Prev</button>
            <span className="text-xs text-slate-500">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
            <button disabled={page * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="File New FIR">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">FIR Number *</label>
              <input className="input" placeholder="e.g. FIR/DL/2024/001" value={form.fir_number} onChange={(e) => set('fir_number', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Incident Date *</label>
              <input className="input" type="datetime-local" value={form.incident_date} onChange={(e) => set('incident_date', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Title *</label>
            <input className="input" placeholder="Brief case title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Police Station *</label>
              <select className="input" value={form.station_id} onChange={(e) => set('station_id', e.target.value)} required>
                <option value="">Select station</option>
                {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Crime Type *</label>
              <select className="input" value={form.crime_type_id} onChange={(e) => set('crime_type_id', e.target.value)} required>
                <option value="">Select type</option>
                {crimeTypes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Location</label>
            <input className="input" placeholder="Incident location" value={form.location_name} onChange={(e) => set('location_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Describe the incident..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <><Spinner size="sm" /> Filing…</> : 'File FIR'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
