import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import Spinner from '@/components/common/Spinner'

export default function AnalystML() {
  const [hotspots,  setHotspots]  = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/ml/hotspots').catch(() => ({ data: [] })),
      api.get('/ml/anomalies').catch(() => ({ data: [] })),
    ]).then(([h, a]) => {
      setHotspots(Array.isArray(h.data) ? h.data : [])
      setAnomalies(Array.isArray(a.data) ? a.data : [])
    }).catch(() => setError('ML service unavailable'))
      .finally(() => setLoading(false))
  }, [])

  const MODELS = [
    { name: 'Crime Hotspot Classifier', type: 'DBSCAN Clustering',    status: hotspots.length > 0 ? 'Active' : 'No Data' },
    { name: 'Anomaly Detector',         type: 'Isolation Forest',     status: anomalies.length > 0 ? 'Active' : 'No Data' },
    { name: 'Recidivism Predictor',     type: 'Random Forest',        status: 'On Demand' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="ML Predictions"
        subtitle="Machine learning model outputs and predictions"
        action={<span className="badge bg-accent/15 text-accent-300 border border-accent/30 text-xs">ML Active</span>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Models Deployed"  value="3"                                    accent />
        <StatCard title="Hotspot Clusters" value={loading ? '…' : hotspots.length} />
        <StatCard title="Anomalies Found"  value={loading ? '…' : anomalies.length} />
        <StatCard title="Risk Scoring"     value="On Demand" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-white">Deployed Models</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              {['Model', 'Algorithm', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => (
              <tr key={m.name} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                <td className="px-5 py-3 font-medium text-white">{m.name}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">{m.type}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold ${m.status === 'Active' ? 'text-success' : m.status === 'On Demand' ? 'text-yellow-400' : 'text-slate-500'}`}>{m.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <div className="card p-6 text-center text-slate-500 text-sm">{error}</div>
      ) : (
        <>
          {hotspots.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crime Hotspot Clusters</p>
              <p className="text-xs text-slate-500 mb-4">{hotspots.length} clusters detected via DBSCAN</p>
              <div className="space-y-3">
                {hotspots.slice(0, 10).map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface-300 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">Cluster #{i + 1}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {h.center_lat?.toFixed(4) ?? h.lat?.toFixed(4)}, {h.center_lng?.toFixed(4) ?? h.lng?.toFixed(4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Incidents</p>
                      <p className="text-sm font-bold text-accent-300">{h.count ?? h.size ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {anomalies.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Anomalous Incidents</p>
              <p className="text-xs text-slate-500 mb-4">{anomalies.length} outliers detected via Isolation Forest</p>
              <div className="space-y-2">
                {anomalies.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-300 rounded-lg px-4 py-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <p className="text-sm text-slate-300">{a.title ?? a.fir_number ?? `Anomaly #${i + 1}`}</p>
                    {a.anomaly_score && (
                      <span className="ml-auto text-xs font-mono text-accent-300">score: {a.anomaly_score.toFixed(3)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hotspots.length === 0 && anomalies.length === 0 && (
            <div className="card p-8 text-center text-slate-500 text-sm">
              No ML results yet. Add FIR data with coordinates to enable hotspot and anomaly detection.
            </div>
          )}
        </>
      )}
    </div>
  )
}
