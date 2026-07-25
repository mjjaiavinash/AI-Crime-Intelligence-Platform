import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import NetworkGraph from '@/components/graph/NetworkGraph'

// Rich Karnataka criminal network — suspects, FIRs, victims, vehicles, bank accounts
const NETWORK_NODES = [
  // Suspects
  { id: 'sus-1', label: 'Ravi Shankar Yadav', type: 'suspect', district: 'Bengaluru Urban', threat: 'High',   status: 'Arrested'   },
  { id: 'sus-2', label: 'Deepak Malhotra',    type: 'suspect', district: 'Dakshina Kannada', threat: 'Medium', status: 'At Large'   },
  { id: 'sus-3', label: 'Suresh Chand Jain',  type: 'suspect', district: 'South Delhi',      threat: 'Low',    status: 'Arrested'   },
  { id: 'sus-4', label: 'Imran Khan',         type: 'suspect', district: 'Mysuru',           threat: 'High',   status: 'Absconding' },
  { id: 'sus-5', label: 'Venkatesh Naidu',    type: 'suspect', district: 'Bengaluru Urban',  threat: 'High',   status: 'At Large'   },
  { id: 'sus-6', label: 'Arjun Gowda',        type: 'suspect', district: 'Mysuru',           threat: 'Medium', status: 'Arrested'   },
  { id: 'sus-7', label: 'Salim Pasha',        type: 'suspect', district: 'Belagavi',         threat: 'Extreme',status: 'Absconding' },
  { id: 'sus-8', label: 'Ramesh Tiwari',      type: 'suspect', district: 'Kalaburagi',       threat: 'Medium', status: 'At Large'   },

  // FIRs / Cases
  { id: 'fir-1', label: 'FIR/KA/BU/2024/001', type: 'crime', status: 'Under Investigation', district: 'Bengaluru Urban' },
  { id: 'fir-2', label: 'FIR/KA/BU/2024/002', type: 'crime', status: 'Filed',               district: 'Bengaluru Urban' },
  { id: 'fir-3', label: 'FIR/KA/MY/2024/001', type: 'crime', status: 'Under Investigation', district: 'Mysuru'          },
  { id: 'fir-4', label: 'FIR/KA/DK/2024/002', type: 'crime', status: 'Filed',               district: 'Dakshina Kannada'},
  { id: 'fir-5', label: 'FIR/KA/BG/2024/001', type: 'crime', status: 'Under Investigation', district: 'Belagavi'        },
  { id: 'fir-6', label: 'FIR/KA/KL/2024/001', type: 'crime', status: 'Under Investigation', district: 'Kalaburagi'      },
  { id: 'fir-7', label: 'FIR/KA/BU/2024/013', type: 'crime', status: 'Under Investigation', district: 'Bengaluru Urban' },

  // Victims
  { id: 'vic-1', label: 'Mohan Lal Gupta',  type: 'victim', district: 'Bengaluru Urban', status: 'Minor Injury' },
  { id: 'vic-2', label: 'Vikram Nair',       type: 'victim', district: 'Dakshina Kannada',status: 'No Injury'    },
  { id: 'vic-3', label: 'Anita Desai',       type: 'victim', district: 'Mysuru',          status: 'No Injury'    },
  { id: 'vic-4', label: 'Unknown Male',      type: 'victim', district: 'Bengaluru Urban', status: 'Fatal'        },

  // Vehicles
  { id: 'veh-1', label: 'DL-4C-XY-9988',  type: 'vehicle', status: 'Seized'  },
  { id: 'veh-2', label: 'KA-05-MN-3344',  type: 'vehicle', status: 'Active'  },
  { id: 'veh-3', label: 'MH-02-BZ-4567',  type: 'vehicle', status: 'Active'  },

  // Bank accounts
  { id: 'bnk-1', label: 'HDFC — Deepak M.',  type: 'bank_account', status: 'Frozen' },
  { id: 'bnk-2', label: 'SBI — Suresh J.',   type: 'bank_account', status: 'Frozen' },
  { id: 'bnk-3', label: 'Axis — Imran K.',   type: 'bank_account', status: 'Flagged'},

  // Locations
  { id: 'loc-1', label: 'Whitefield, BLR',   type: 'location', district: 'Bengaluru Urban' },
  { id: 'loc-2', label: 'Palace Area, MYS',  type: 'location', district: 'Mysuru'          },
  { id: 'loc-3', label: 'Hampankatta, MNG',  type: 'location', district: 'Dakshina Kannada'},
]

const NETWORK_EDGES = [
  // Suspects → FIRs
  { source: 'sus-1', target: 'fir-1', label: 'main accused'   },
  { source: 'sus-1', target: 'fir-7', label: 'main accused'   },
  { source: 'sus-2', target: 'fir-1', label: 'co-accused'     },
  { source: 'sus-2', target: 'fir-4', label: 'main accused'   },
  { source: 'sus-3', target: 'fir-2', label: 'main accused'   },
  { source: 'sus-4', target: 'fir-3', label: 'main accused'   },
  { source: 'sus-4', target: 'fir-5', label: 'co-accused'     },
  { source: 'sus-5', target: 'fir-1', label: 'co-accused'     },
  { source: 'sus-5', target: 'fir-2', label: 'co-accused'     },
  { source: 'sus-6', target: 'fir-3', label: 'co-accused'     },
  { source: 'sus-7', target: 'fir-5', label: 'main accused'   },
  { source: 'sus-7', target: 'fir-6', label: 'main accused'   },
  { source: 'sus-8', target: 'fir-6', label: 'co-accused'     },

  // Victims → FIRs
  { source: 'vic-1', target: 'fir-1', label: 'victim_of' },
  { source: 'vic-2', target: 'fir-4', label: 'victim_of' },
  { source: 'vic-3', target: 'fir-3', label: 'victim_of' },
  { source: 'vic-4', target: 'fir-7', label: 'victim_of' },

  // Suspects → Vehicles
  { source: 'sus-1', target: 'veh-1', label: 'owns' },
  { source: 'sus-4', target: 'veh-2', label: 'owns' },
  { source: 'sus-2', target: 'veh-3', label: 'owns' },

  // Suspects → Bank accounts
  { source: 'sus-2', target: 'bnk-1', label: 'account_holder' },
  { source: 'sus-3', target: 'bnk-2', label: 'account_holder' },
  { source: 'sus-4', target: 'bnk-3', label: 'account_holder' },

  // FIRs → Locations
  { source: 'fir-1', target: 'loc-1', label: 'occurred_at' },
  { source: 'fir-2', target: 'loc-1', label: 'occurred_at' },
  { source: 'fir-3', target: 'loc-2', label: 'occurred_at' },
  { source: 'fir-4', target: 'loc-3', label: 'occurred_at' },

  // Gang links between suspects
  { source: 'sus-4', target: 'sus-7', label: 'linked_to' },
  { source: 'sus-1', target: 'sus-5', label: 'linked_to' },
  { source: 'sus-7', target: 'sus-8', label: 'linked_to' },
]

const INSIGHTS = [
  { icon: '🔴', label: 'Most Connected Suspect', value: 'Ravi Shankar Yadav', sub: '3 FIRs · 1 vehicle · gang link' },
  { icon: '🔗', label: 'Highest Risk Gang',       value: 'Salim Pasha Network', sub: 'Belagavi–Kalaburagi corridor' },
  { icon: '📋', label: 'Most Linked FIR',         value: 'FIR/KA/BU/2024/001', sub: '3 suspects · 1 victim · 1 location' },
  { icon: '🏦', label: 'Frozen Assets',           value: '₹10.4 Lakh',          sub: '2 accounts frozen by court order' },
]

export default function AnalystNetwork() {
  const [view, setView] = useState('full') // full | suspects | firs | financial

  const viewFilters = {
    full:      NETWORK_NODES,
    suspects:  NETWORK_NODES.filter(n => ['suspect','crime','victim'].includes(n.type)),
    firs:      NETWORK_NODES.filter(n => ['crime','location','victim'].includes(n.type)),
    financial: NETWORK_NODES.filter(n => ['suspect','bank_account','vehicle'].includes(n.type)),
  }

  const activeNodes = viewFilters[view]
  const activeIds   = new Set(activeNodes.map(n => n.id))
  const activeEdges = NETWORK_EDGES.filter(e => activeIds.has(e.source) && activeIds.has(e.target))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Network Analysis"
        subtitle="Criminal relationship graph — suspects, FIRs, victims, assets"
        action={
          <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">
            {NETWORK_NODES.length} nodes · {NETWORK_EDGES.length} edges
          </span>
        }
      />

      {/* Insight cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {INSIGHTS.map((ins) => (
          <div key={ins.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{ins.icon}</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{ins.label}</p>
            </div>
            <p className="text-sm font-bold text-white">{ins.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{ins.sub}</p>
          </div>
        ))}
      </div>

      {/* View switcher */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Criminal Network Graph</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {activeNodes.length} nodes · {activeEdges.length} connections
            </p>
          </div>
          <div className="flex gap-1.5">
            {[
              { key: 'full',      label: '🌐 Full Network'   },
              { key: 'suspects',  label: '👤 Suspect–Case'   },
              { key: 'firs',      label: '📋 Case–Location'  },
              { key: 'financial', label: '🏦 Financial'      },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  view === key
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-surface-300 border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        <NetworkGraph nodes={activeNodes} edges={activeEdges} />
      </div>

      {/* Edge legend */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-white mb-3">Connection Types</p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Main Accused',    color: '#ef4444' },
            { label: 'Co-Accused',      color: '#f97316' },
            { label: 'Victim Of',       color: '#a855f7' },
            { label: 'Owns (Vehicle)',  color: '#eab308' },
            { label: 'Account Holder', color: '#10b981' },
            { label: 'Occurred At',    color: '#f97316' },
            { label: 'Gang Link',      color: '#64748b' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-6 h-0.5 rounded" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
