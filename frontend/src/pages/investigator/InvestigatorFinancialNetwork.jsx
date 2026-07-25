import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import NetworkGraph from '@/components/graph/NetworkGraph'

const FREEZE_COLOR = {
  active:         'text-green-400 bg-green-500/10 border-green-500/30',
  frozen:         'text-red-400 bg-red-500/10 border-red-500/30',
  under_scrutiny: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  closed:         'text-slate-400 bg-slate-500/10 border-slate-500/30',
}

const FREEZE_DESC = {
  active:         'Normal account, no restrictions',
  frozen:         'Account frozen by court/police order',
  under_scrutiny: 'Under investigation for suspicious activity',
  closed:         'Account closed',
}

function buildFinancialGraph(accounts) {
  const nodes = []
  const edges = []
  const seen  = new Set()

  accounts.forEach((acc) => {
    const accId = `bank-${acc.id}`
    if (!seen.has(accId)) {
      nodes.push({ id: accId, label: `${acc.bank_name}\n${acc.account_number.slice(-4).padStart(acc.account_number.length, '•')}`, type: 'bank_account' })
      seen.add(accId)
    }
    if (acc.suspect_id) {
      const susId = `suspect-${acc.suspect_id}`
      if (!seen.has(susId)) {
        nodes.push({ id: susId, label: acc.suspect_name ?? `Suspect #${acc.suspect_id}`, type: 'suspect' })
        seen.add(susId)
      }
      edges.push({ source: accId, target: susId, label: 'owned by' })
    }
    if (acc.fir_id) {
      const firId = `fir-${acc.fir_id}`
      if (!seen.has(firId)) {
        nodes.push({ id: firId, label: `FIR #${acc.fir_id}`, type: 'fir' })
        seen.add(firId)
      }
      edges.push({ source: accId, target: firId, label: 'linked to' })
    }
  })

  return { nodes, edges }
}

export default function InvestigatorFinancialNetwork() {
  const [accounts, setAccounts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [view,     setView]     = useState('graph')

  useEffect(() => {
    api.get('/bank-accounts?page_size=100')
      .then((r) => setAccounts(r.data.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  const { nodes, edges } = buildFinancialGraph(accounts)
  const flaggedTotal = accounts.reduce((sum, a) => sum + (parseFloat(a.flagged_amount) || 0), 0)
  const frozenCount       = accounts.filter((a) => a.freeze_status === 'frozen').length
  const scrutinyCount     = accounts.filter((a) => a.freeze_status === 'under_scrutiny').length
  const activeCount       = accounts.filter((a) => a.freeze_status === 'active').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Financial Network"
        subtitle="Bank accounts, money trails, and financial links to suspects and cases"
        action={
          <div className="flex items-center gap-2">
            <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">{accounts.length} accounts</span>
            {frozenCount > 0 && (
              <span className="badge bg-red-500/15 text-red-400 border border-red-500/30 text-xs animate-pulse">{frozenCount} frozen</span>
            )}
          </div>
        }
      />

      {/* What is this page */}
      <div className="card p-5 border-l-4 border-emerald-500">
        <p className="text-sm font-semibold text-white mb-1">What is this?</p>
        <p className="text-sm text-slate-400 leading-relaxed">
          This page tracks <span className="text-white font-medium">bank accounts linked to suspects and FIRs</span>.
          It helps investigators follow the money — identifying which accounts belong to accused persons,
          which are frozen by court order, and which have suspicious transactions.
          The <span className="text-white font-medium">Network Graph</span> shows financial relationships visually,
          while the <span className="text-white font-medium">Account Table</span> lists all accounts with their status.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts',   value: accounts.length,  color: 'text-white',        sub: 'All linked accounts' },
          { label: 'Active',           value: activeCount,      color: 'text-green-400',     sub: 'No restrictions' },
          { label: 'Frozen',           value: frozenCount,      color: 'text-red-400',       sub: 'Court/police order' },
          { label: 'Under Scrutiny',   value: scrutinyCount,    color: 'text-yellow-400',    sub: 'Under investigation' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Account status legend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {Object.entries(FREEZE_COLOR).map(([status, cls]) => (
          <div key={status} className={`card p-4 border flex items-start gap-3 ${cls}`}>
            <span className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${
              status === 'active' ? 'bg-green-400' : status === 'frozen' ? 'bg-red-400' : status === 'under_scrutiny' ? 'bg-yellow-400' : 'bg-slate-400'
            }`} />
            <div>
              <p className="text-sm font-semibold text-white capitalize">{status.replace('_', ' ')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{FREEZE_DESC[status]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {[
          { key: 'graph', label: 'Network Graph', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { key: 'table', label: 'Account Table',  icon: 'M3 10h18M3 6h18M3 14h18M3 18h18' },
        ].map(({ key, label, icon }) => (
          <button key={key} onClick={() => setView(key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${view === key ? 'bg-primary-500/20 text-white border border-primary-500/40' : 'text-slate-500 border border-slate-700 hover:text-white'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : accounts.length === 0 ? (
        <div className="card p-10 text-center space-y-2">
          <svg className="w-10 h-10 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-slate-400 text-sm font-medium">No bank accounts linked yet</p>
          <p className="text-slate-600 text-xs">Add bank accounts via investigator tools and link them to suspects or FIRs.</p>
        </div>
      ) : view === 'graph' ? (
        <div className="card p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-white">Financial Relationship Graph</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Shows which bank accounts belong to which suspects and are linked to which FIRs ·
              Drag to rearrange · Scroll to zoom
            </p>
          </div>
          <NetworkGraph nodes={nodes} edges={edges} />
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs text-slate-400">
            <div className="flex gap-2 bg-surface-300 rounded-lg p-3">
              <span className="text-emerald-400 font-bold shrink-0">●</span>
              <p><span className="text-white font-medium">Green hexagon</span> = Bank account node</p>
            </div>
            <div className="flex gap-2 bg-surface-300 rounded-lg p-3">
              <span className="text-red-400 font-bold shrink-0">■</span>
              <p><span className="text-white font-medium">Red square</span> = Suspect who owns the account</p>
            </div>
            <div className="flex gap-2 bg-surface-300 rounded-lg p-3">
              <span className="text-blue-400 font-bold shrink-0">◆</span>
              <p><span className="text-white font-medium">Blue diamond</span> = FIR the account is linked to</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Account Registry</p>
              <p className="text-xs text-slate-500 mt-0.5">All bank accounts linked to suspects or FIRs</p>
            </div>
            <span className="text-xs text-slate-500">{accounts.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['#', 'Account Holder', 'Bank', 'Account No.', 'Type', 'Flagged Amount', 'Txn Count', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">#{acc.id}</td>
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{acc.account_holder_name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{acc.bank_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{acc.account_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 capitalize">{acc.account_type}</td>
                    <td className="px-4 py-3 text-xs font-mono">
                      {acc.flagged_amount
                        ? <span className="text-yellow-400">₹{Number(acc.flagged_amount).toLocaleString()}</span>
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{acc.transaction_count ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className={`badge border text-xs capitalize ${FREEZE_COLOR[acc.freeze_status] ?? 'text-slate-400 border-slate-600'}`}>
                          {acc.freeze_status}
                        </span>
                        <p className="text-[10px] text-slate-600 mt-0.5">{FREEZE_DESC[acc.freeze_status] ?? ''}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Investigation notes */}
      {accounts.some((a) => a.notes) && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Investigation Notes</p>
          <p className="text-xs text-slate-500 mb-3">Officer remarks on suspicious accounts</p>
          <div className="space-y-2">
            {accounts.filter((a) => a.notes).map((acc) => (
              <div key={acc.id} className="flex gap-3 bg-surface-300 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-white">{acc.account_holder_name} · {acc.bank_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{acc.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
