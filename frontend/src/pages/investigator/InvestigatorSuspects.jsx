import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import { cleanText } from '@/utils/helpers'
import toast from 'react-hot-toast'

const THREAT_COLOR = {
  extreme: 'text-red-400', high: 'text-orange-400',
  medium: 'text-yellow-400', low: 'text-green-400',
}
const STATUS_COLOR = {
  at_large: 'text-accent-400', arrested: 'text-emerald-400',
  bailed: 'text-yellow-400', absconding: 'text-red-400', deceased: 'text-slate-500',
}

const EMPTY = {
  full_name: '', alias: '', gender: 'male', age_estimated: '',
  threat_level: 'low', arrest_status: 'at_large',
  gang_affiliation: '', is_known_criminal: false,
  fir_id: '', role_in_case: '',
}
const PAGE_SIZE = 20

export default function InvestigatorSuspects() {
  const [suspects,     setSuspects]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [total,        setTotal]        = useState(0)
  const [firs,         setFirs]         = useState([])
  const [open,         setOpen]         = useState(false)
  const [editSuspect,  setEditSuspect]  = useState(null)
  const [form,         setForm]         = useState(EMPTY)
  const [saving,       setSaving]       = useState(false)
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)

  const load = (p = page) => {
    setLoading(true)
    api.get(`/suspects?page=${p}&page_size=${PAGE_SIZE}`)
      .then((r) => { setSuspects(r.data.items ?? []); setTotal(r.data.total ?? 0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])
  useEffect(() => { api.get('/fir?page_size=500').then((r) => setFirs(r.data.items ?? [])).catch(() => {}) }, [])

  const openCreate = () => { setEditSuspect(null); setForm(EMPTY); setOpen(true) }

  const openEdit = (s) => {
    setEditSuspect(s)
    setForm({
      full_name:        s.full_name ?? '',
      alias:            s.alias ?? '',
      gender:           s.gender ?? 'male',
      age_estimated:    s.age_estimated ?? '',
      threat_level:     s.threat_level ?? 'low',
      arrest_status:    s.arrest_status ?? 'at_large',
      gang_affiliation: s.gang_affiliation ?? '',
      is_known_criminal:s.is_known_criminal ?? false,
      fir_id:           '',
      role_in_case:     s.role_in_case ?? '',
    })
    setOpen(true)
  }

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editSuspect && !form.fir_id) { toast.error('Please select a FIR'); return }
    if (!form.full_name) { toast.error('Enter suspect name'); return }
    setSaving(true)
    try {
      if (editSuspect) {
        const { data } = await api.patch(`/suspects/${editSuspect.id}`, {
          full_name:         form.full_name,
          alias:             form.alias || null,
          gender:            form.gender,
          age_estimated:     form.age_estimated ? parseInt(form.age_estimated) : null,
          threat_level:      form.threat_level,
          arrest_status:     form.arrest_status,
          gang_affiliation:  form.gang_affiliation || null,
          is_known_criminal: form.is_known_criminal,
          role_in_case:      form.role_in_case || null,
        })
        setSuspects((p) => p.map((s) => s.id === editSuspect.id ? data : s))
        toast.success('Suspect updated successfully')
      } else {
        await api.post('/suspects', {
          fir_id:            parseInt(form.fir_id),
          full_name:         form.full_name,
          alias:             form.alias || null,
          gender:            form.gender,
          age_estimated:     form.age_estimated ? parseInt(form.age_estimated) : null,
          threat_level:      form.threat_level,
          arrest_status:     form.arrest_status,
          gang_affiliation:  form.gang_affiliation || null,
          is_known_criminal: form.is_known_criminal,
          role_in_case:      form.role_in_case || null,
        })
        toast.success('Suspect added successfully')
        load(page)
      }
      setOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? (editSuspect ? 'Failed to update suspect' : 'Failed to add suspect'))
    } finally {
      setSaving(false)
    }
  }

  const COLUMNS = [
    { key: 'full_name',     label: 'Name',   render: (r) => <span className="font-medium text-white">{cleanText(r.full_name) || 'Unknown'}</span> },
    { key: 'alias',         label: 'Alias',  render: (r) => <span className="text-slate-400 text-xs">{cleanText(r.alias) || '—'}</span> },
    { key: 'gender',        label: 'Gender', render: (r) => <span className="capitalize text-slate-300 text-xs">{r.gender}</span> },
    { key: 'age_estimated', label: 'Age',    render: (r) => <span className="text-slate-300 text-xs">{r.age_estimated ?? '—'}</span> },
    { key: 'threat_level',  label: 'Threat', render: (r) => <span className={`text-xs font-semibold capitalize ${THREAT_COLOR[r.threat_level]}`}>{r.threat_level}</span> },
    { key: 'arrest_status', label: 'Status', render: (r) => <span className={`text-xs font-semibold capitalize ${STATUS_COLOR[r.arrest_status]}`}>{r.arrest_status?.replace('_', ' ')}</span> },
    { key: 'actions',       label: '',       render: (r) => (
      <button onClick={() => openEdit(r)}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-all whitespace-nowrap">
        Edit
      </button>
    )},
  ]

  const filtered = search.trim()
    ? suspects.filter((r) =>
        r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.alias?.toLowerCase().includes(search.toLowerCase()) ||
        r.gang_affiliation?.toLowerCase().includes(search.toLowerCase())
      )
    : suspects

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Suspects"
        subtitle="Suspect profiles linked to cases"
        action={
          <div className="flex items-center gap-3">
            <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{total} total</span>
            <button onClick={openCreate} className="btn-primary text-sm">+ Add Suspect</button>
          </div>
        }
      />

      <div className="card">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm font-semibold text-white shrink-0">Suspect Registry</p>
          <input className="input text-sm py-1.5 w-full sm:flex-1 sm:max-w-xs" placeholder="Search name, alias, gang…"
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

      <Modal open={open} onClose={() => setOpen(false)} title={editSuspect ? `Edit Suspect — ${cleanText(editSuspect.full_name)}` : 'Add Suspect'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input className="input" placeholder="Suspect full name" value={form.full_name} onChange={f('full_name')} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Alias / Nickname</label>
              <input className="input" placeholder="Known alias" value={form.alias} onChange={f('alias')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
              <select className="input" value={form.gender} onChange={f('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Estimated Age</label>
              <input className="input" type="number" min="10" max="100" placeholder="Age" value={form.age_estimated} onChange={f('age_estimated')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Threat Level</label>
              <select className="input" value={form.threat_level} onChange={f('threat_level')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Arrest Status</label>
              <select className="input" value={form.arrest_status} onChange={f('arrest_status')}>
                <option value="at_large">At Large</option>
                <option value="arrested">Arrested</option>
                <option value="bailed">Bailed</option>
                <option value="absconding">Absconding</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Gang Affiliation</label>
            <input className="input" placeholder="Gang or group name (if any)" value={form.gang_affiliation} onChange={f('gang_affiliation')} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="known" checked={form.is_known_criminal} onChange={f('is_known_criminal')} className="w-4 h-4 accent-primary-500" />
            <label htmlFor="known" className="text-sm text-slate-400">Known criminal (prior record)</label>
          </div>

          {!editSuspect && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Link to FIR *</label>
                <select className="input" value={form.fir_id} onChange={f('fir_id')} required>
                  <option value="">Select FIR…</option>
                  {firs.map((fir) => <option key={fir.id} value={fir.id}>{fir.fir_number}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Role in Case</label>
                <input className="input" placeholder="e.g. main accused" value={form.role_in_case} onChange={f('role_in_case')} />
              </div>
            </div>
          )}

          {editSuspect && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Role in Case</label>
              <input className="input" placeholder="e.g. main accused" value={form.role_in_case} onChange={f('role_in_case')} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : editSuspect ? 'Save Changes' : 'Add Suspect'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
