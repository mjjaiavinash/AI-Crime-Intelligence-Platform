import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import { formatDate, cleanText } from '@/utils/helpers'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'filed',               label: 'Filed' },
  { value: 'under_investigation', label: 'Under Investigation' },
  { value: 'charge_sheet_filed',  label: 'Charge Sheet Filed' },
  { value: 'referred_to_court',   label: 'Referred to Court' },
  { value: 'closed_true',         label: 'Closed (True Case)' },
  { value: 'closed_false',        label: 'Closed (False Case)' },
]

const PAGE_SIZE = 20

export default function InvestigatorCases() {
  const [firs,    setFirs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [search,  setSearch]  = useState('')

  // status modal
  const [selected,   setSelected]   = useState(null)   // fir being updated
  const [newStatus,  setNewStatus]  = useState('')
  const [updating,   setUpdating]   = useState(false)

  const fetchFirs = () => {
    setLoading(true)
    api.get(`/fir?page=${page}&page_size=${PAGE_SIZE}`)
      .then((r) => { setFirs(r.data.items ?? []); setTotal(r.data.total ?? 0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchFirs() }, [page])

  const openModal = (fir) => { setSelected(fir); setNewStatus(fir.status) }
  const closeModal = () => { setSelected(null); setNewStatus('') }

  const handleUpdate = async () => {
    if (!selected || newStatus === selected.status) return closeModal()
    setUpdating(true)
    try {
      await api.patch(`/fir/${selected.id}`, { status: newStatus })
      toast.success('Case status updated')
      fetchFirs()
      closeModal()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const COLUMNS = [
    { key: 'fir_number',    label: 'FIR No.',  render: (r) => <span className="font-mono text-xs text-primary-300">{r.fir_number}</span> },
    { key: 'title',         label: 'Case',     render: (r) => <span className="font-medium text-white">{cleanText(r.title)}</span> },
    { key: 'incident_date', label: 'Date',     render: (r) => formatDate(r.incident_date) },
    { key: 'location_name', label: 'Location', render: (r) => <span className="text-slate-400 text-xs">{r.location_name || '—'}</span> },
    { key: 'status',        label: 'Status',   render: (r) => <Badge label={r.status.replace(/_/g, ' ')} variant={r.status} /> },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <button
          onClick={() => openModal(r)}
          className="text-xs px-2.5 py-1 rounded bg-primary-500/15 text-primary-300 border border-primary-500/30 hover:bg-primary-500/25 transition-colors"
        >
          Update Status
        </button>
      )
    },
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
        title="Cases"
        subtitle="All filed FIRs"
        action={<span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{total} total</span>}
      />

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-white shrink-0">FIR List</p>
          <input
            className="input text-sm py-1.5 max-w-xs"
            placeholder="Search FIR no., title, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

      {/* Status Update Modal */}
      <Modal open={!!selected} title="Update Case Status" onClose={closeModal}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">FIR</p>
            <p className="text-sm font-mono text-primary-300">{selected?.fir_number}</p>
            <p className="text-sm text-white mt-0.5">{cleanText(selected?.title ?? '')}</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">New Status</label>
            <select
              className="input w-full text-sm"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={closeModal} className="btn-ghost text-sm">Cancel</button>
            <button
              onClick={handleUpdate}
              disabled={updating || newStatus === selected?.status}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {updating ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
