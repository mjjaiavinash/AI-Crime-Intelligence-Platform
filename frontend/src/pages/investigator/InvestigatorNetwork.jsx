import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import NetworkGraph from '@/components/graph/NetworkGraph'
import Spinner from '@/components/common/Spinner'

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Criminal Network"
        subtitle="Suspect relationship and connection graph"
        action={!loading && <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30 text-xs">{nodes.length} nodes · {edges.length} edges</span>}
      />
      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-1">Network Graph</p>
        <p className="text-xs text-slate-500 mb-4">Crime-suspect relationship visualization</p>
        {loading
          ? <div className="flex justify-center py-16"><Spinner /></div>
          : nodes.length === 0
            ? <div className="text-center py-16 text-slate-500 text-sm">No network data yet. Add suspects linked to FIRs to build the graph.</div>
            : <NetworkGraph nodes={nodes} edges={edges} />
        }
      </div>
    </div>
  )
}
