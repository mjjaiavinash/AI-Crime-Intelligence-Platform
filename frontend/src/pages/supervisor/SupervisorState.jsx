import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import CrimeMap from '@/components/map/CrimeMap'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import Spinner from '@/components/common/Spinner'

export default function SupervisorState() {
  const [crimes,   setCrimes]   = useState([])
  const [hotspots, setHotspots] = useState([])
  const [byType,   setByType]   = useState([])
  const [summary,  setSummary]  = useState(null)
  const [stations, setStations] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/fir?page_size=100'),
      api.get('/analytics/hotspots'),
      api.get('/analytics/by-type'),
      api.get('/analytics/summary'),
      api.get('/police-stations?page_size=100'),
    ]).then(([f, h, b, s, ps]) => {
      setCrimes((f.data.items ?? []).filter((r) => r.latitude && r.longitude).map((r) => ({
        id: r.id, title: r.title, fir_number: r.fir_number, status: r.status,
        latitude: parseFloat(r.latitude), longitude: parseFloat(r.longitude),
      })))
      setHotspots((h.data ?? []).map((p) => ({
        latitude: p.lat, longitude: p.lng, intensity: p.count, radius_km: Math.max(0.3, p.count * 0.05),
      })))
      setByType(b.data ?? [])
      setSummary(s.data)
      setStations(ps.data.items ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Crimes',    value: summary?.total_crimes ?? '…',    color: 'text-accent-300' },
    { label: 'Police Stations', value: stations.length || '…',          color: 'text-blue-400' },
    { label: 'Open Cases',      value: summary?.open_cases ?? '…',      color: 'text-yellow-400' },
    { label: 'Closed Cases',    value: summary?.closed_cases ?? '…',    color: 'text-success' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="State Overview" subtitle="Complete state-level crime intelligence" />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      {loading
        ? <div className="flex justify-center py-16"><Spinner /></div>
        : <>
          <div className="card p-5">
            <p className="text-sm font-semibold text-white mb-1">State Crime Map</p>
            <p className="text-xs text-slate-500 mb-4">{crimes.length} incidents with coordinates</p>
            <CrimeMap crimes={crimes} hotspots={hotspots} />
          </div>

          {byType.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crimes by Type</p>
              <p className="text-xs text-slate-500 mb-4">Distribution across all categories</p>
              <CrimeBarChart data={byType} />
            </div>
          )}
        </>
      }
    </div>
  )
}
