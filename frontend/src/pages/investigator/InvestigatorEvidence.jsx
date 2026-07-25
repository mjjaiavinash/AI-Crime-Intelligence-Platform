import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import { formatDate, cleanText } from '@/utils/helpers'
import toast from 'react-hot-toast'

const STATUS_COLOR = {
  collected: 'text-blue-400', submitted_to_lab: 'text-yellow-400',
  lab_report_received: 'text-success', filed: 'text-slate-400',
  disposed: 'text-slate-500', transferred: 'text-purple-400',
}

const COLUMNS = [
  { key: 'id',             label: '#',         render: (r) => <span className="font-mono text-slate-500">#{r.id}</span> },
  { key: 'evidence_type',  label: 'Type',      render: (r) => <span className="text-xs px-2 py-0.5 rounded bg-surface-300 text-slate-300 border border-slate-700/50 capitalize">{r.evidence_type?.replace('_', ' ')}</span> },
  { key: 'title',          label: 'Title',     render: (r) => <span className="font-medium text-white">{cleanText(r.title)}</span> },
  { key: 'fir_id',         label: 'FIR',       render: (r) => <span className="font-mono text-xs text-primary-300">#{r.fir_id}</span> },
  { key: 'collection_date',label: 'Collected', render: (r) => r.collection_date ? formatDate(r.collection_date) : '—' },
  { key: 'status',         label: 'Status',    render: (r) => <span className={`text-xs font-semibold capitalize ${STATUS_COLOR[r.status] ?? 'text-slate-400'}`}>{r.status?.replace(/_/g, ' ')}</span> },
]

const EMPTY = {
  fir_id: '', evidence_type: 'physical', title: '',
  description: '', collection_date: '', status: 'collected',
}
const PAGE_SIZE = 20

export default function InvestigatorEvidence() {
  const [evidence, setEvidence] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [total,    setTotal]    = useState(0)
  const [firs,     setFirs]     = useState([])
  const [open,     setOpen]     = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)

  const load = (p = page) => {
    setLoading(true)
    api.get(`/evidence?page=${p}&page_size=${PAGE_SIZE}`)
      .then((r) => { setEvidence(r.data.items ?? []); setTotal(r.data.total ?? 0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])
  useEffect(() => { api.get('/fir?page_size=100').then((r) => setFirs(r.data.items ?? [])) }, [])

  const filtered = search.trim()
    ? evidence.filter((r) =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.evidence_type?.toLowerCase().includes(search.toLowerCase()) ||
        r.status?.toLowerCase().includes(search.toLowerCase())
      )
    : evidence

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fir_id) { toast.error('Please select a FIR'); return }
    if (!form.title)  { toast.error('Enter evidence title'); return }
    setSaving(true)
    try {
      await api.post('/evidence', {
        ...form,
        fir_id: parseInt(form.fir_id),
        collection_date: form.collection_date || null,
      })
      toast.success('Evidence added successfully')
      setOpen(false)
      setForm(EMPTY)
      load(page)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to add evidence')
    } finally {
      setSaving(false)
    }
  }

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Evidence"
        subtitle="Chain of custody records"
        action={
          <div className="flex items-center gap-3">
            <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{total} items</span>
            <button onClick={() => setOpen(true)} className="btn-primary text-sm">+ Add Evidence</button>
          </div>
        }
      />

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-4">
          <p className="text-sm font-semibold text-white shrink-0">Evidence Registry</p>
          <input
            className="input text-sm py-1.5 flex-1 max-w-xs"
            placeholder="Search title, type, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

      <Modal open={open} onClose={() => setOpen(false)} title="Add Evidence">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Link to FIR *</label>
            <select className="input" value={form.fir_id} onChange={f('fir_id')} required>
              <option value="">Select FIR…</option>
              {firs.map((fir) => <option key={fir.id} value={fir.id}>{fir.fir_number} — {cleanText(fir.title)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Evidence Title *</label>
            <input className="input" placeholder="e.g. CCTV Footage from ATM" value={form.title} onChange={f('title')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Evidence Type</label>
              <select className="input" value={form.evidence_type} onChange={f('evidence_type')}>
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
                <option value="documentary">Documentary</option>
                <option value="forensic">Forensic</option>
                <option value="cctv_footage">CCTV Footage</option>
                <option value="witness_statement">Witness Statement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select className="input" value={form.status} onChange={f('status')}>
                <option value="collected">Collected</option>
                <option value="submitted_to_lab">Submitted to Lab</option>
                <option value="lab_report_received">Lab Report Received</option>
                <option value="filed">Filed</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Collection Date</label>
            <input className="input" type="datetime-local" value={form.collection_date} onChange={f('collection_date')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Describe the evidence…" value={form.description} onChange={f('description')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : 'Add Evidence'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
