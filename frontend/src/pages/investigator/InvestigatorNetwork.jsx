import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import NetworkGraph from '@/components/graph/NetworkGraph'
import Spinner from '@/components/common/Spinner'

const INFO_CARDS = [
  { color: 'bg-red-500/15 border-red-500/30 text-red-400',     dot: 'bg-red-500',     label: 'Suspect',   desc: 'A person accused or linked to a crime' },
  { color: 'bg-blue-500/15 border-blue-500/30 text-blue-400',  dot: 'bg-blue-500',    label: 'FIR / Case', desc: 'A registered First Information Report' },
  { color: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400', dot: 'bg-yellow-500', label: 'Vehicle', desc: 'A vehicle linked to a suspect or case' },
  { color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-500', label: 'Bank Account', desc: 'A financial account tied to a suspect' },
]

export default function InvestigatorNetwork() {
  const [nodes,   setNodes]   = useState([])
  const [edges,   setEdges]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/network')
      .then((r) => {
        setNodes(r.data.nodes ?? [])
        setEdges(r.data.edges ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const suspectCount = nodes.filter(n => n.type === 'suspect').length
  const firCount     = nodes.filter(n => n.type === 'fir').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Criminal Network"
        subtitle="Visual map of how suspects, cases, and assets are connected"
        action={
          !loading && nodes.length > 0 && (
            <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 text-xs">
              {nodes.length} nodes · {edges.length} connections
            </span>
          )
        }
      />

      {/* What is this page */}
      <div className="card p-5 border-l-4 border-primary-500">
        <p className="text-sm font-semibold text-white mb-1">What is this?</p>
        <p className="text-sm text-slate-400 leading-relaxed">
          This graph shows how criminals are connected to each other and to registered cases.
          Each <span className="text-white font-medium">node (circle/shape)</span> is a person, case, or asset.
          Each <span className="text-white font-medium">line (edge)</span> means they are linked — for example, a suspect is accused in a FIR, or a vehicle is registered to a suspect.
          Use this to identify gang networks, co-accused, and repeat offenders across multiple cases.
        </p>
      </div>

      {/* Legend cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {INFO_CARDS.map(({ color, dot, label, desc }) => (
          <div key={label} className={`card p-4 border ${color} flex items-start gap-3`}>
            <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${dot}`} />
            <div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      {!loading && nodes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Suspects',    value: suspectCount, color: 'text-red-400' },
            { label: 'Linked FIRs',       value: firCount,     color: 'text-blue-400' },
            { label: 'Total Connections', value: edges.length, color: 'text-primary-300' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Graph */}
      <div className="card p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-white">Network Graph</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag nodes to rearrange · Scroll to zoom · Click a node to highlight its connections
          </p>
        </div>
        {loading
          ? <div className="flex justify-center py-16"><Spinner /></div>
          : nodes.length === 0
            ? (
              <div className="text-center py-16 space-y-2">
                <svg className="w-10 h-10 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-slate-400 text-sm font-medium">No network data yet</p>
                <p className="text-slate-600 text-xs">Add suspects and link them to FIRs to build the criminal network graph.</p>
              </div>
            )
            : <NetworkGraph nodes={nodes} edges={edges} />
        }
      </div>

      {/* How to read */}
      {!loading && nodes.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-3">How to read this graph</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex gap-2">
              <span className="text-primary-400 font-bold shrink-0">1.</span>
              <p><span className="text-white font-medium">Clusters</span> — nodes grouped closely together share many connections, indicating a gang or organized group.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-primary-400 font-bold shrink-0">2.</span>
              <p><span className="text-white font-medium">Hub nodes</span> — a node with many lines coming out of it is a key person or case central to multiple crimes.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-primary-400 font-bold shrink-0">3.</span>
              <p><span className="text-white font-medium">Isolated nodes</span> — nodes with no connections are standalone records not yet linked to any case or person.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
