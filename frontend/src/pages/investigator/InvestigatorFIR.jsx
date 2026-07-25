import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import Spinner from '@/components/common/Spinner'
import { formatDate, cleanText } from '@/utils/helpers'

const EMPTY = { title: '', description: '', fir_number: '', station_id: '', crime_type_id: '', incident_date: '', location_name: '', latitude: '', longitude: '', io_officer_id: '', status: 'filed' }
const PAGE_SIZE = 20
const STATUS_OPTIONS = ['filed', 'under_investigation', 'charge_sheet_filed', 'closed_true', 'closed_false', 'referred_to_court']

export default function InvestigatorFIR() {
  const [firs,       setFirs]       = useState([])
  const [stations,   setStations]   = useState([])
  const [crimeTypes, setCrimeTypes] = useState([])
  const [officers,   setOfficers]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [open,       setOpen]       = useState(false)
  const [editFir,    setEditFir]    = useState(null)   // null = create, object = edit
  const [submitting, setSubmitting] = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [total,      setTotal]      = useState(0)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.get(`/fir?page=${page}&page_size=${PAGE_SIZE}`),
      api.get('/police-stations?page_size=100'),
      api.get('/crime-types?page_size=100'),
      api.get('/officers?page_size=200&is_active=true'),
    ]).then(([f, s, c, o]) => {
      if (f.status === 'fulfilled') { setFirs(f.value.data.items ?? []); setTotal(f.value.data.total ?? 0) }
      if (s.status === 'fulfilled') setStations(s.value.data.items ?? [])
      if (c.status === 'fulfilled') setCrimeTypes(c.value.data.items ?? [])
      if (o.status === 'fulfilled') setOfficers(o.value.data.items ?? [])
    }).finally(() => setLoading(false))
  }, [page])

  const openCreate = () => {
    setEditFir(null)
    setForm(EMPTY)
    setOpen(true)
  }

  const openEdit = (fir) => {
    setEditFir(fir)
    setForm({
      title:         fir.title ?? '',
      description:   fir.description ?? '',
      fir_number:    fir.fir_number ?? '',
      station_id:    fir.station_id ?? '',
      crime_type_id: fir.crime_type_id ?? '',
      incident_date: fir.incident_date ? fir.incident_date.slice(0, 16) : '',
      location_name: fir.location_name ?? '',
      latitude:      fir.latitude ?? '',
      longitude:     fir.longitude ?? '',
      io_officer_id: fir.io_officer_id ?? '',
      status:        fir.status ?? 'filed',
    })
    setOpen(true)
  }

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.station_id || !form.crime_type_id || !form.fir_number || !form.incident_date) {
      toast.error('Fill all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const station = stations.find((s) => s.id === Number(form.station_id))
      if (editFir) {
        // EDIT — PATCH only changed fields
        const payload = {
          title:         form.title,
          description:   form.description || null,
          crime_type_id: Number(form.crime_type_id),
          location_name: form.location_name || null,
          latitude:      form.latitude  ? parseFloat(form.latitude)  : null,
          longitude:     form.longitude ? parseFloat(form.longitude) : null,
          io_officer_id: form.io_officer_id ? Number(form.io_officer_id) : null,
          status:        form.status,
        }
        const { data } = await api.patch(`/fir/${editFir.id}`, payload)
        setFirs((p) => p.map((f) => f.id === editFir.id ? data : f))
        toast.success(`FIR ${data.fir_number} updated.`)
      } else {
        // CREATE
        const payload = {
          fir_number:    form.fir_number,
          title:         form.title,
          description:   form.description || null,
          station_id:    Number(form.station_id),
          district_id:   station?.district_id ?? 1,
          crime_type_id: Number(form.crime_type_id),
          incident_date: new Date(form.incident_date).toISOString(),
          reported_date: new Date().toISOString(),
          location_name: form.location_name || null,
          latitude:      form.latitude  ? parseFloat(form.latitude)  : null,
          longitude:     form.longitude ? parseFloat(form.longitude) : null,
          status:        'filed',
          io_officer_id: form.io_officer_id ? Number(form.io_officer_id) : null,
        }
        const { data } = await api.post('/fir', payload)
        setFirs((p) => [data, ...p])
        setTotal((t) => t + 1)
        toast.success(`FIR ${data.fir_number} filed successfully.`)
      }
      setOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? (editFir ? 'Failed to update FIR.' : 'Failed to file FIR.'))
    } finally {
      setSubmitting(false)
    }
  }

  const COLUMNS = [
    { key: 'fir_number',    label: 'FIR No.',   render: (r) => <span className="font-mono text-xs text-primary-300 whitespace-nowrap">{r.fir_number}</span> },
    { key: 'title',         label: 'Title',     render: (r) => <span className="font-medium text-white block max-w-[200px] truncate">{cleanText(r.title)}</span> },
    { key: 'incident_date', label: 'Date',      render: (r) => <span className="text-slate-400 text-xs whitespace-nowrap">{formatDate(r.incident_date)}</span> },
    { key: 'io_officer',    label: 'Officer',   render: (r) => <span className="text-slate-400 text-xs whitespace-nowrap">{r.io_officer?.user?.full_name || r.io_officer?.user?.username || '—'}</span> },
    { key: 'status',        label: 'Status',    render: (r) => <Badge label={r.status.replace(/_/g, ' ')} variant={r.status} /> },
    { key: 'actions',       label: '',          render: (r) => (
      <button onClick={() => openEdit(r)}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-all whitespace-nowrap">
        Edit
      </button>
    )},
  ]

  const filtered = search.trim()
    ? firs.filter((r) =>
        r.fir_number?.toLowerCase().includes(search.toLowerCase()) ||
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.location_name?.toLowerCase().includes(search.toLowerCase())
      )
    : firs

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="FIR Management"
        subtitle="First Information Reports"
        action={<button onClick={openCreate} className="btn-primary">+ File FIR</button>}
      />
      <div className="card">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm font-semibold text-white shrink-0">All FIRs</p>
          <input
            className="input text-sm py-1.5 w-full sm:flex-1 sm:max-w-xs"
            placeholder="Search FIR no., title, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 shrink-0 sm:ml-auto">{total} records</span>
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

      <Modal open={open} onClose={() => setOpen(false)} title={editFir ? `Edit FIR — ${editFir.fir_number}` : 'File New FIR'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">FIR Number *</label>
              <input className="input" placeholder="e.g. FIR/KA/2024/001"
                value={form.fir_number}
                onChange={(e) => set('fir_number', e.target.value)}
                disabled={!!editFir}
                required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Incident Date *</label>
              <input className="input" type="datetime-local"
                value={form.incident_date}
                onChange={(e) => set('incident_date', e.target.value)}
                disabled={!!editFir}
                required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Title *</label>
            <input className="input" placeholder="Brief case title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Police Station *</label>
              <select className="input" value={form.station_id} onChange={(e) => set('station_id', e.target.value)} disabled={!!editFir} required>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Investigating Officer</label>
              <select className="input" value={form.io_officer_id} onChange={(e) => set('io_officer_id', e.target.value)}>
                <option value="">Unassigned</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.user?.full_name || o.user?.username} — {o.badge_number} ({o.rank})
                  </option>
                ))}
              </select>
            </div>
            {editFir && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
                <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Location</label>
            <input className="input" placeholder="Incident location" value={form.location_name} onChange={(e) => set('location_name', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Latitude</label>
              <input className="input" type="number" step="any" placeholder="e.g. 12.9716" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Longitude</label>
              <input className="input" type="number" step="any" placeholder="e.g. 77.5946" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Describe the incident..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <><Spinner size="sm" /> {editFir ? 'Saving…' : 'Filing…'}</> : editFir ? 'Save Changes' : 'File FIR'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
