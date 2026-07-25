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
        <div className="px-4 sm:px-5 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm font-semibold text-white shrink-0">FIR List</p>
          <input
            className="input text-sm py-1.5 w-full sm:max-w-xs"
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
        <div className="space-y-5">

          {/* FIR Info Card */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-700/20 to-primary-900/10 border border-primary-500/20 rounded-xl" />
            <div className="relative p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-mono text-primary-300 tracking-wide">{selected?.fir_number}</p>
                <p className="text-sm font-semibold text-white mt-0.5 leading-snug">{cleanText(selected?.title ?? '')}</p>
                <div className="mt-2">
                  <Badge label={selected?.status?.replace(/_/g, ' ')} variant={selected?.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-3">Select New Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const isActive = newStatus === s.value
                const colorMap = {
                  filed:               'border-blue-500/40 bg-blue-500/10 text-blue-300',
                  under_investigation: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
                  charge_sheet_filed:  'border-purple-500/40 bg-purple-500/10 text-purple-300',
                  referred_to_court:   'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
                  closed_true:         'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                  closed_false:        'border-red-500/40 bg-red-500/10 text-red-300',
                }
                const activeColor = colorMap[s.value] ?? 'border-primary-500/40 bg-primary-500/10 text-primary-300'
                return (
                  <button
                    key={s.value}
                    onClick={() => setNewStatus(s.value)}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150 text-left ${
                      isActive
                        ? `${activeColor} shadow-sm`
                        : 'border-slate-700/60 bg-surface-300/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? 'bg-current shadow-[0_0_6px_currentColor]' : 'bg-slate-600'
                    }`} />
                    {s.label}
                    {isActive && (
                      <svg className="w-3.5 h-3.5 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-700/50">
            <button onClick={closeModal} className="btn-ghost text-sm">Cancel</button>
            <button
              onClick={handleUpdate}
              disabled={updating || newStatus === selected?.status}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {updating ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
              ) : 'Apply Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
