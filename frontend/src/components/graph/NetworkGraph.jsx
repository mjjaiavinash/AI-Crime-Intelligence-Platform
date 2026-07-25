import React, { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'

const NODE_CONFIG = {
  suspect:      { color: '#ef4444', border: '#fca5a5', shape: 'ellipse',        size: 44, icon: '👤' },
  crime:        { color: '#3b82f6', border: '#93c5fd', shape: 'diamond',        size: 40, icon: '📋' },
  victim:       { color: '#a855f7', border: '#d8b4fe', shape: 'ellipse',        size: 36, icon: '🧑' },
  vehicle:      { color: '#eab308', border: '#fde68a', shape: 'round-triangle', size: 34, icon: '🚗' },
  bank_account: { color: '#10b981', border: '#6ee7b7', shape: 'round-hexagon',  size: 34, icon: '🏦' },
  location:     { color: '#f97316', border: '#fdba74', shape: 'round-pentagon', size: 34, icon: '📍' },
}

const EDGE_COLORS = {
  'main accused':   '#ef4444',
  'co-accused':     '#f97316',
  'linked_to':      '#64748b',
  'victim_of':      '#a855f7',
  'owns':           '#eab308',
  'account_holder': '#10b981',
  'occurred_at':    '#f97316',
}

export default function NetworkGraph({ nodes = [], edges = [] }) {
  const containerRef = useRef(null)
  const cyRef        = useRef(null)
  const [selected,   setSelected]   = useState(null)
  const [layout,     setLayout]     = useState('cose')
  const [filter,     setFilter]     = useState('all')
  const [search,     setSearch]     = useState('')

  const filteredNodes = nodes.filter(n => {
    if (filter !== 'all' && n.type !== filter) return false
    if (search && !n.label?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target))

  useEffect(() => {
    if (!containerRef.current || filteredNodes.length === 0) return

    if (cyRef.current) { cyRef.current.destroy() }

    const elements = [
      ...filteredNodes.map(node => {
        const cfg = NODE_CONFIG[node.type] || NODE_CONFIG.crime
        return {
          data: { id: node.id, label: node.label, type: node.type, ...node },
          style: {
            'background-color':       cfg.color,
            'border-color':           cfg.border,
            'border-width':           2,
            'shape':                  cfg.shape,
            'width':                  cfg.size,
            'height':                 cfg.size,
            'label':                  node.label?.length > 14 ? node.label.slice(0, 13) + '…' : node.label,
            'color':                  '#f1f5f9',
            'font-size':              '9px',
            'font-weight':            '600',
            'text-valign':            'bottom',
            'text-halign':            'center',
            'text-margin-y':          6,
            'text-background-opacity': 0.85,
            'text-background-color':  '#0f172a',
            'text-background-padding': '2px',
            'text-background-shape':  'roundrectangle',
          }
        }
      }),
      ...filteredEdges.map(edge => ({
        data: { id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target, label: edge.label || '' },
        style: {
          'width':               2,
          'line-color':          EDGE_COLORS[edge.label] || '#475569',
          'target-arrow-color':  EDGE_COLORS[edge.label] || '#475569',
          'target-arrow-shape':  'triangle',
          'curve-style':         'bezier',
          'label':               edge.label || '',
          'font-size':           '8px',
          'color':               '#94a3b8',
          'text-rotation':       'autorotate',
          'text-margin-y':       -8,
          'text-background-opacity': 0.7,
          'text-background-color':   '#0f172a',
          'text-background-padding': '2px',
        }
      }))
    ]

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        { selector: 'node:selected', style: { 'border-width': 4, 'border-color': '#ffffff', 'overlay-opacity': 0.1 } },
        { selector: 'edge:selected', style: { 'width': 4, 'line-color': '#ffffff' } },
      ],
      layout: {
        name: layout,
        padding: 50,
        animate: true,
        animationDuration: 600,
        nodeRepulsion: 8000,
        idealEdgeLength: 120,
        gravity: 0.25,
      },
      wheelSensitivity: 0.3,
    })

    cy.on('tap', 'node', (e) => {
      const d = e.target.data()
      setSelected({ ...d, connectedEdges: cy.edges(`[source="${d.id}"], [target="${d.id}"]`).length })
    })
    cy.on('tap', (e) => { if (e.target === cy) setSelected(null) })

    cyRef.current = cy
    return () => { if (cyRef.current) cyRef.current.destroy() }
  }, [filteredNodes, filteredEdges, layout])

  const handleFit    = () => cyRef.current?.fit(undefined, 40)
  const handleZoomIn = () => cyRef.current?.zoom({ level: (cyRef.current.zoom() || 1) * 1.3, renderedPosition: { x: containerRef.current.offsetWidth / 2, y: containerRef.current.offsetHeight / 2 } })
  const handleZoomOut= () => cyRef.current?.zoom({ level: (cyRef.current.zoom() || 1) * 0.75, renderedPosition: { x: containerRef.current.offsetWidth / 2, y: containerRef.current.offsetHeight / 2 } })
  const handleRelayout = (l) => { setLayout(l); cyRef.current?.layout({ name: l, padding: 50, animate: true, animationDuration: 500, nodeRepulsion: 8000, idealEdgeLength: 120 }).run() }

  const nodeTypes = ['all', ...new Set(nodes.map(n => n.type))]

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="pl-8 pr-3 py-1.5 text-xs bg-surface-300 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 w-40"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-1">
          {nodeTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border capitalize transition-colors ${
                filter === t
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-surface-300 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >{t}</button>
          ))}
        </div>

        <div className="ml-auto flex gap-1">
          {/* Layout buttons */}
          {[['cose','Force'],['circle','Circle'],['grid','Grid'],['breadthfirst','Tree']].map(([l, label]) => (
            <button
              key={l}
              onClick={() => handleRelayout(l)}
              className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border transition-colors ${
                layout === l
                  ? 'bg-slate-600/40 border-slate-500 text-white'
                  : 'bg-surface-300 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >{label}</button>
          ))}
          {/* Zoom controls */}
          <button onClick={handleZoomIn}  className="px-2.5 py-1.5 text-xs bg-surface-300 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">+</button>
          <button onClick={handleZoomOut} className="px-2.5 py-1.5 text-xs bg-surface-300 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">−</button>
          <button onClick={handleFit}     className="px-2.5 py-1.5 text-[10px] bg-surface-300 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">Fit</button>
        </div>
      </div>

      <div className="flex gap-3">
        {/* Graph canvas */}
        <div className="relative flex-1 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden" style={{ minHeight: 520 }}>
          {filteredNodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
              No nodes match the current filter
            </div>
          ) : (
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />
          )}

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-lg px-3 py-2 text-[10px] space-y-1.5 z-20">
            <p className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Legend</p>
            {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-2 text-slate-400 capitalize">
                <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ background: cfg.color }} />
                {type.replace('_', ' ')}
              </div>
            ))}
          </div>

          {/* Stats overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-lg px-3 py-2 text-[10px] z-20 space-y-0.5">
            <p className="text-slate-300 font-semibold">{filteredNodes.length} nodes · {filteredEdges.length} edges</p>
            <p className="text-slate-500">Click a node to inspect</p>
          </div>
        </div>

        {/* Node detail panel */}
        <div className={`w-64 shrink-0 transition-all duration-200 ${selected ? 'opacity-100' : 'opacity-40'}`}>
          <div className="card p-4 h-full">
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{NODE_CONFIG[selected.type]?.icon || '🔵'}</span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{selected.label}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{selected.type?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="border-t border-slate-700/50 pt-3 space-y-2">
                  <Row label="Node ID"     value={selected.id} />
                  <Row label="Type"        value={selected.type?.replace('_', ' ')} />
                  <Row label="Connections" value={selected.connectedEdges} />
                  {selected.district  && <Row label="District"  value={selected.district} />}
                  {selected.status    && <Row label="Status"    value={selected.status} />}
                  {selected.threat    && <Row label="Threat"    value={selected.threat} />}
                </div>
                <div
                  className="w-full h-1.5 rounded-full mt-2"
                  style={{ background: NODE_CONFIG[selected.type]?.color || '#475569' }}
                />
                <button
                  onClick={() => setSelected(null)}
                  className="w-full text-[10px] text-slate-500 hover:text-slate-300 transition-colors pt-1"
                >✕ Deselect</button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
                <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                <p className="text-xs text-slate-600">Click any node<br/>to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[10px] text-slate-300 font-medium text-right capitalize">{String(value)}</span>
    </div>
  )
}
