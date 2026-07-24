import { useEffect, useState, useRef } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import CrimeMap from '@/components/map/CrimeMap'
import Spinner from '@/components/common/Spinner'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AnalystHeatmaps() {
  const [crimes,    setCrimes]    = useState([])
  const [hotspots,  setHotspots]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [sliderIdx, setSliderIdx] = useState(null)   // null = show all
  const [playing,   setPlaying]   = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    Promise.all([
      api.get('/fir?page_size=200'),
      api.get('/analytics/hotspots'),
    ]).then(([f, h]) => {
      const mapped = (f.data.items ?? [])
        .filter((r) => r.latitude && r.longitude)
        .map((r) => ({
          id:           r.id,
          title:        r.title,
          fir_number:   r.fir_number,
          status:       r.status,
          latitude:     parseFloat(r.latitude),
          longitude:    parseFloat(r.longitude),
          incident_date: r.incident_date,
        }))
      setCrimes(mapped)
      const hs = (h.data ?? []).map((p) => ({
        latitude:  p.lat,
        longitude: p.lng,
        intensity: p.count,
        radius_km: Math.max(0.3, p.count * 0.05),
      }))
      setHotspots(hs)
    }).finally(() => setLoading(false))
  }, [])

  // Build month buckets from crime dates
  const monthBuckets = MONTHS.map((m, mi) => {
    const filtered = crimes.filter((c) => {
      if (!c.incident_date) return false
      const d = new Date(c.incident_date)
      return d.getMonth() === mi
    })
    return { label: m, crimes: filtered }
  }).filter((b) => b.crimes.length > 0)

  const displayCrimes = sliderIdx !== null && monthBuckets[sliderIdx]
    ? monthBuckets[sliderIdx].crimes
    : crimes

  const togglePlay = () => {
    if (playing) {
      clearInterval(intervalRef.current)
      setPlaying(false)
    } else {
      setPlaying(true)
      setSliderIdx(0)
      intervalRef.current = setInterval(() => {
        setSliderIdx((prev) => {
          const next = (prev ?? 0) + 1
          if (next >= monthBuckets.length) {
            clearInterval(intervalRef.current)
            setPlaying(false)
            return null
          }
          return next
        })
      }, 1200)
    }
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Crime Heatmaps"
        subtitle="Geographic crime density visualization with time slider"
        action={!loading && <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">{crimes.length} incidents mapped</span>}
      />
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-white">Crime Density Map</p>
          {monthBuckets.length > 1 && (
            <span className="text-xs text-slate-500">
              {sliderIdx !== null ? monthBuckets[sliderIdx]?.label : 'All months'}
              {sliderIdx !== null && <span className="ml-1 text-slate-600">· {displayCrimes.length} incidents</span>}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-4">Incident locations and hotspot clusters</p>

        {/* Time slider controls */}
        {!loading && monthBuckets.length > 1 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  playing ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                }`}
              >
                {playing ? (
                  <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause</>
                ) : (
                  <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Animate</>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={monthBuckets.length - 1}
                value={sliderIdx ?? monthBuckets.length - 1}
                onChange={(e) => { clearInterval(intervalRef.current); setPlaying(false); setSliderIdx(Number(e.target.value)) }}
                className="flex-1 accent-blue-500 h-1.5 rounded-full"
              />
              <button
                onClick={() => { clearInterval(intervalRef.current); setPlaying(false); setSliderIdx(null) }}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >Reset</button>
            </div>
            <div className="flex justify-between px-1">
              {monthBuckets.map((b, i) => (
                <span
                  key={b.label}
                  className={`text-[9px] cursor-pointer transition-colors ${
                    sliderIdx === i ? 'text-blue-400 font-bold' : 'text-slate-700 hover:text-slate-400'
                  }`}
                  onClick={() => setSliderIdx(i)}
                >{b.label}</span>
              ))}
            </div>
          </div>
        )}

        {loading
          ? <div className="flex justify-center py-16"><Spinner /></div>
          : <CrimeMap crimes={displayCrimes} hotspots={hotspots} />
        }
      </div>
    </div>
  )
}
