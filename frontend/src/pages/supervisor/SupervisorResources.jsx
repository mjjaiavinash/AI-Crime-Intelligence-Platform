import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import Spinner from '@/components/common/Spinner'

export default function SupervisorResources() {
  const [officers, setOfficers] = useState([])
  const [stations, setStations] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/officers?page_size=200'),
      api.get('/police-stations?page_size=100'),
    ]).then(([o, s]) => {
      setOfficers(o.data.items ?? [])
      setStations(s.data.items ?? [])
    }).finally(() => setLoading(false))
  }, [])

  // Group officers by district
  const byDistrict = officers.reduce((acc, o) => {
    const key = `District #${o.district_id}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(byDistrict).map(([crime_type, total]) => ({ crime_type, total }))

  const activeOfficers  = officers.filter((o) => o.is_active).length
  const activeStations  = stations.filter((s) => s.is_active !== false).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Resource Allocation" subtitle="Officer and station deployment overview" />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Officers',  value: officers.length,  color: 'text-primary-300' },
              { label: 'Active Officers', value: activeOfficers,   color: 'text-success' },
              { label: 'Total Stations',  value: stations.length,  color: 'text-blue-400' },
              { label: 'Active Stations', value: activeStations,   color: 'text-success' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-1">Officers by District</p>
              <p className="text-xs text-slate-500 mb-4">Current deployment distribution</p>
              <CrimeBarChart data={chartData} />
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <p className="text-sm font-semibold text-white">Station Resource Status</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Station', 'Code', 'District', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stations.map((s) => (
                  <tr key={s.id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-white">{s.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{s.station_code}</td>
                    <td className="px-5 py-3 text-slate-400">District #{s.district_id}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${s.is_active !== false ? 'text-success' : 'text-slate-500'}`}>
                        {s.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
