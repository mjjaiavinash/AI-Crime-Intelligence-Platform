import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import NetworkGraph from '@/components/graph/NetworkGraph'
import Spinner from '@/components/common/Spinner'

export default function AnalystNetwork() {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Network Analysis"
        subtitle="Crime and suspect relationship graph"
        action={!loading && <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">{nodes.length} nodes · {edges.length} edges</span>}
      />
      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-1">Criminal Network Graph</p>
        <p className="text-xs text-slate-500 mb-4">Connections between suspects and FIRs</p>
        {loading
          ? <div className="flex justify-center py-16"><Spinner /></div>
          : nodes.length === 0
            ? <p className="text-center text-slate-500 text-sm py-16">No network data available. Add suspects and link them to FIRs.</p>
            : <NetworkGraph nodes={nodes} edges={edges} />
        }
      </div>
    </div>
  )
}
