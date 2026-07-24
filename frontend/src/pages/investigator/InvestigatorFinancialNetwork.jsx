import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import NetworkGraph from '@/components/graph/NetworkGraph'

const FREEZE_COLOR = {
  active:  'text-green-400 bg-green-500/10 border-green-500/30',
  frozen:  'text-red-400 bg-red-500/10 border-red-500/30',
  flagged: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
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
  const [view,     setView]     = useState('graph') // 'graph' | 'table'

  useEffect(() => {
    api.get('/bank-accounts?page_size=100')
      .then((r) => setAccounts(r.data.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  const { nodes, edges } = buildFinancialGraph(accounts)

  const flaggedTotal = accounts.reduce((sum, a) => sum + (parseFloat(a.flagged_amount) || 0), 0)
  const frozenCount  = accounts.filter((a) => a.freeze_status === 'frozen').length
  const flaggedCount = accounts.filter((a) => a.freeze_status === 'flagged').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Financial Network"
        subtitle="Bank account links, money trails, and transaction intelligence"
        action={
          <div className="flex items-center gap-2">
            <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">
              {accounts.length} accounts
            </span>
            {frozenCount > 0 && (
              <span className="badge bg-red-500/15 text-red-400 border border-red-500/30 text-xs animate-pulse">
                {frozenCount} frozen
              </span>
            )}
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts',    value: accounts.length },
          { label: 'Frozen Accounts',   value: frozenCount },
          { label: 'Flagged Accounts',  value: flaggedCount },
          { label: 'Flagged Amount',    value: flaggedTotal > 0 ? `₹${(flaggedTotal / 100000).toFixed(1)}L` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {['graph', 'table'].map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors
              ${view === v ? 'bg-primary-500/20 text-white border border-primary-500/40' : 'text-slate-500 border border-slate-700 hover:text-white'}`}>
            {v === 'graph' ? '🕸️ Network Graph' : '📋 Account Table'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : accounts.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm">
          No bank accounts linked yet. Add accounts via the investigator tools and link them to suspects or FIRs.
        </div>
      ) : view === 'graph' ? (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-white">Financial Relationship Graph</p>
              <p className="text-xs text-slate-500">{nodes.length} nodes · {edges.length} connections</p>
            </div>
          </div>
          <NetworkGraph nodes={nodes} edges={edges} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <p className="text-sm font-semibold text-white">Account Registry</p>
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
                      <span className={`badge border text-xs capitalize ${FREEZE_COLOR[acc.freeze_status] ?? 'text-slate-400 border-slate-600'}`}>
                        {acc.freeze_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Money trail summary */}
      {accounts.some((a) => a.notes) && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-3">Investigation Notes</p>
          <div className="space-y-2">
            {accounts.filter((a) => a.notes).map((acc) => (
              <div key={acc.id} className="flex gap-3 bg-surface-300 rounded-lg px-4 py-3">
                <span className="text-yellow-400 text-xs mt-0.5 shrink-0">⚠</span>
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
