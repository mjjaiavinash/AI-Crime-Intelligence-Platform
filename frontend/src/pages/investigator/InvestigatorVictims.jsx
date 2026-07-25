import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import { formatDate, cleanText } from '@/utils/helpers'
import toast from 'react-hot-toast'

const INJURY_COLOR = {
  none: 'text-slate-400', minor: 'text-yellow-400',
  grievous: 'text-red-400', fatal: 'text-red-600',
}

const EMPTY = { fir_id: '', full_name: '', gender: 'male', age_at_incident: '', phone: '', address: '', injury_type: 'none', statement: '', is_anonymous: false }
const PAGE_SIZE = 20

export default function InvestigatorVictims() {
  const [victims,     setVictims]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [total,       setTotal]       = useState(0)
  const [firs,        setFirs]        = useState([])
  const [open,        setOpen]        = useState(false)
  const [editVictim,  setEditVictim]  = useState(null)
  const [form,        setForm]        = useState(EMPTY)
  const [saving,      setSaving]      = useState(false)
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)

  const load = (p = page) => {
    setLoading(true)
    api.get(`/victims?page=${p}&page_size=${PAGE_SIZE}`)
      .then((r) => { setVictims(r.data.items ?? []); setTotal(r.data.total ?? 0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])
  useEffect(() => { api.get('/fir?page_size=500').then((r) => setFirs(r.data.items ?? [])).catch(() => {}) }, [])

  const openCreate = () => { setEditVictim(null); setForm(EMPTY); setOpen(true) }

  const openEdit = (v) => {
    setEditVictim(v)
    setForm({
      fir_id:          v.fir_id ?? '',
      full_name:       v.is_anonymous ? '' : (v.full_name ?? ''),
      gender:          v.gender ?? 'male',
      age_at_incident: v.age_at_incident ?? '',
      phone:           v.phone ?? '',
      address:         v.address ?? '',
      injury_type:     v.injury_type ?? 'none',
      statement:       v.statement ?? '',
      is_anonymous:    v.is_anonymous ?? false,
    })
    setOpen(true)
  }

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editVictim && !form.fir_id) { toast.error('Please select a FIR'); return }
    if (!form.full_name && !form.is_anonymous) { toast.error('Enter victim name or mark as anonymous'); return }
    setSaving(true)
    try {
      if (editVictim) {
        const { data } = await api.patch(`/victims/${editVictim.id}`, {
          full_name:       form.is_anonymous ? 'Anonymous' : form.full_name,
          gender:          form.gender,
          age_at_incident: form.age_at_incident ? parseInt(form.age_at_incident) : null,
          phone:           form.phone || null,
          address:         form.address || null,
          injury_type:     form.injury_type,
          statement:       form.statement || null,
          is_anonymous:    form.is_anonymous,
        })
        setVictims((p) => p.map((v) => v.id === editVictim.id ? data : v))
        toast.success('Victim updated successfully')
      } else {
        await api.post('/victims', {
          ...form,
          fir_id:          parseInt(form.fir_id),
          full_name:       form.is_anonymous ? 'Anonymous' : form.full_name,
          age_at_incident: form.age_at_incident ? parseInt(form.age_at_incident) : null,
        })
        toast.success('Victim added successfully')
        load(page)
      }
      setOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? (editVictim ? 'Failed to update victim' : 'Failed to add victim'))
    } finally {
      setSaving(false)
    }
  }

  const COLUMNS = [
    { key: 'full_name',       label: 'Name',     render: (r) => <span className="font-medium text-white">{r.is_anonymous ? 'Anonymous' : cleanText(r.full_name)}</span> },
    { key: 'gender',          label: 'Gender',   render: (r) => <span className="capitalize text-slate-300 text-xs">{r.gender}</span> },
    { key: 'age_at_incident', label: 'Age',      render: (r) => <span className="text-slate-300 text-xs">{r.age_at_incident ?? '—'}</span> },
    { key: 'fir_id',          label: 'FIR',      render: (r) => <span className="font-mono text-xs text-primary-300">#{r.fir_id}</span> },
    { key: 'injury_type',     label: 'Injury',   render: (r) => <span className={`text-xs font-semibold capitalize ${INJURY_COLOR[r.injury_type] ?? 'text-slate-400'}`}>{r.injury_type}</span> },
    { key: 'created_at',      label: 'Recorded', render: (r) => <span className="text-slate-400 text-xs whitespace-nowrap">{formatDate(r.created_at)}</span> },
    { key: 'actions',         label: '',         render: (r) => (
      <button onClick={() => openEdit(r)}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-all whitespace-nowrap">
        Edit
      </button>
    )},
  ]

  const filtered = search.trim()
    ? victims.filter((r) =>
        r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.injury_type?.toLowerCase().includes(search.toLowerCase()) ||
        r.gender?.toLowerCase().includes(search.toLowerCase())
      )
    : victims

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Victims"
        subtitle="Victim records linked to FIRs"
        action={
          <div className="flex items-center gap-3">
            <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{total} total</span>
            <button onClick={openCreate} className="btn-primary text-sm">+ Add Victim</button>
          </div>
        }
      />

      <div className="card">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm font-semibold text-white shrink-0">Victim Registry</p>
          <input className="input text-sm py-1.5 w-full sm:flex-1 sm:max-w-xs" placeholder="Search name, injury, gender…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? <div className="flex justify-center py-12"><Spinner /></div>
          : <Table columns={COLUMNS} data={filtered} loading={false} />}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs disabled:opacity-40">← Prev</button>
            <span className="text-xs text-slate-500">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
            <button disabled={page * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editVictim ? `Edit Victim — ${editVictim.is_anonymous ? 'Anonymous' : cleanText(editVictim.full_name)}` : 'Add Victim'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editVictim && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Link to FIR *</label>
              <select className="input" value={form.fir_id} onChange={f('fir_id')} required>
                <option value="">Select FIR…</option>
                {firs.map((fir) => <option key={fir.id} value={fir.id}>{fir.fir_number} — {cleanText(fir.title)}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="anon" checked={form.is_anonymous} onChange={f('is_anonymous')} className="w-4 h-4 accent-primary-500" />
            <label htmlFor="anon" className="text-sm text-slate-400">Anonymous victim</label>
          </div>

          {!form.is_anonymous && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input className="input" placeholder="Victim full name" value={form.full_name} onChange={f('full_name')} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
              <select className="input" value={form.gender} onChange={f('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Age at Incident</label>
              <input className="input" type="number" min="0" max="120" placeholder="Age" value={form.age_at_incident} onChange={f('age_at_incident')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Phone</label>
              <input className="input" placeholder="Mobile number" value={form.phone} onChange={f('phone')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Injury Type</label>
              <select className="input" value={form.injury_type} onChange={f('injury_type')}>
                <option value="none">None</option>
                <option value="minor">Minor</option>
                <option value="grievous">Grievous</option>
                <option value="fatal">Fatal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Address</label>
            <input className="input" placeholder="Victim address" value={form.address} onChange={f('address')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Statement</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Victim statement…" value={form.statement} onChange={f('statement')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : editVictim ? 'Save Changes' : 'Add Victim'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
