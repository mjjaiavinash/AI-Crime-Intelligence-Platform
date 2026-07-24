import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import Spinner from '@/components/common/Spinner'

export default function AnalystDistricts() {
  const [summary,  setSummary]  = useState(null)
  const [stations, setStations] = useState([])
  const [byType,   setByType]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/police-stations?page_size=100'),
      api.get('/analytics/by-type'),
    ]).then(([s, ps, b]) => {
      setSummary(s.data)
      setStations(ps.data.items ?? [])
      setByType(b.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  // Group stations by district
  const districtMap = stations.reduce((acc, s) => {
    const key = s.district_id
    if (!acc[key]) acc[key] = { district_id: key, stations: 0, names: [] }
    acc[key].stations++
    acc[key].names.push(s.name)
    return acc
  }, {})

  const districts = Object.values(districtMap).sort((a, b) => a.district_id - b.district_id)
  const chartData = districts.map((d) => ({ crime_type: `District #${d.district_id}`, total: d.stations }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="District Analytics" subtitle="Crime statistics and station distribution by district" />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Crimes',    value: summary?.total_crimes ?? 0,        color: 'text-accent-300' },
              { label: 'Open Cases',      value: summary?.open_cases ?? 0,          color: 'text-yellow-400' },
              { label: 'Closed Cases',    value: summary?.closed_cases ?? 0,        color: 'text-success' },
              { label: 'Districts',       value: districts.length,                  color: 'text-primary-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Stations per District</p>
              <p className="text-xs text-slate-500 mb-4">{stations.length} total stations across {districts.length} districts</p>
              <CrimeBarChart data={chartData} />
            </div>
          )}

          {byType.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Crime Type Distribution</p>
              <p className="text-xs text-slate-500 mb-4">Incidents by category across all districts</p>
              <CrimeBarChart data={byType} />
            </div>
          )}

          {districts.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-white">District Breakdown</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['District ID', 'Stations', 'Station Names'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {districts.map((d) => (
                    <tr key={d.district_id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-primary-300">#{d.district_id}</td>
                      <td className="px-5 py-3 font-mono text-slate-300">{d.stations}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{d.names.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
