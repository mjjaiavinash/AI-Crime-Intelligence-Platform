import { useEffect, useState, useRef } from 'react'
import PageHeader from '@/components/common/PageHeader'
import CrimeMap from '@/components/map/CrimeMap'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Hardcoded Karnataka crime incidents with real coordinates
const KARNATAKA_CRIMES = [
  // Bengaluru Urban
  { id:1,  title:'Armed Robbery at MG Road',         fir_number:'FIR/KA/BU/2024/001', status:'under_investigation', latitude:12.9758, longitude:77.6045, incident_date:'2024-01-10' },
  { id:2,  title:'Vehicle Theft near Whitefield',    fir_number:'FIR/KA/BU/2024/002', status:'filed',               latitude:12.9698, longitude:77.7499, incident_date:'2024-01-18' },
  { id:3,  title:'Cyber Fraud — UPI Scam',           fir_number:'FIR/KA/BU/2024/003', status:'under_investigation', latitude:12.9352, longitude:77.6245, incident_date:'2024-02-05' },
  { id:4,  title:'Chain Snatching — Koramangala',    fir_number:'FIR/KA/BU/2024/004', status:'filed',               latitude:12.9352, longitude:77.6245, incident_date:'2024-02-14' },
  { id:5,  title:'Burglary at Indiranagar',          fir_number:'FIR/KA/BU/2024/005', status:'charge_sheet_filed',  latitude:12.9784, longitude:77.6408, incident_date:'2024-02-20' },
  { id:6,  title:'Drug Trafficking — Shivajinagar',  fir_number:'FIR/KA/BU/2024/006', status:'under_investigation', latitude:12.9850, longitude:77.6010, incident_date:'2024-03-03' },
  { id:7,  title:'Assault near Cubbon Park',         fir_number:'FIR/KA/BU/2024/007', status:'filed',               latitude:12.9763, longitude:77.5929, incident_date:'2024-03-11' },
  { id:8,  title:'Vehicle Theft — Whitefield',       fir_number:'FIR/KA/BU/2024/008', status:'filed',               latitude:12.9698, longitude:77.7500, incident_date:'2024-03-15' },
  { id:9,  title:'Vehicle Theft — Whitefield IT Park',fir_number:'FIR/KA/BU/2024/009',status:'filed',               latitude:12.9710, longitude:77.7480, incident_date:'2024-03-18' },
  { id:10, title:'Vehicle Theft — Whitefield Signal', fir_number:'FIR/KA/BU/2024/010',status:'under_investigation', latitude:12.9690, longitude:77.7510, incident_date:'2024-03-20' },
  { id:11, title:'Robbery — HSR Layout',             fir_number:'FIR/KA/BU/2024/011', status:'filed',               latitude:12.9116, longitude:77.6474, incident_date:'2024-04-02' },
  { id:12, title:'Online Harassment Case',           fir_number:'FIR/KA/BU/2024/012', status:'filed',               latitude:12.9550, longitude:77.5800, incident_date:'2024-04-09' },
  { id:13, title:'Murder — Hebbal',                  fir_number:'FIR/KA/BU/2024/013', status:'under_investigation', latitude:13.0358, longitude:77.5970, incident_date:'2024-04-22' },
  { id:14, title:'Cheating by Builder',              fir_number:'FIR/KA/BU/2024/014', status:'charge_sheet_filed',  latitude:12.9200, longitude:77.6700, incident_date:'2024-05-07' },
  { id:15, title:'Drunk Driving — Outer Ring Road',  fir_number:'FIR/KA/BU/2024/015', status:'closed_true',         latitude:12.9500, longitude:77.7000, incident_date:'2024-05-19' },

  // Mysuru
  { id:16, title:'Gang Robbery — Mysuru Palace Area',fir_number:'FIR/KA/MY/2024/001', status:'under_investigation', latitude:12.3052, longitude:76.6552, incident_date:'2024-01-25' },
  { id:17, title:'Drug Possession — Nazarbad',       fir_number:'FIR/KA/MY/2024/002', status:'filed',               latitude:12.3000, longitude:76.6500, incident_date:'2024-02-08' },
  { id:18, title:'Theft — Devaraja Market',          fir_number:'FIR/KA/MY/2024/003', status:'closed_true',         latitude:12.3100, longitude:76.6550, incident_date:'2024-02-28' },
  { id:19, title:'Gang Assault — Vijayanagar',       fir_number:'FIR/KA/MY/2024/004', status:'under_investigation', latitude:12.3200, longitude:76.6200, incident_date:'2024-03-14' },
  { id:20, title:'Robbery — Kuvempunagar',           fir_number:'FIR/KA/MY/2024/005', status:'filed',               latitude:12.3300, longitude:76.6100, incident_date:'2024-04-05' },
  { id:21, title:'Cyber Fraud — Mysuru',             fir_number:'FIR/KA/MY/2024/006', status:'filed',               latitude:12.2958, longitude:76.6394, incident_date:'2024-05-12' },
  { id:22, title:'Gang Activity — Lashkar Mohalla',  fir_number:'FIR/KA/MY/2024/007', status:'under_investigation', latitude:12.3080, longitude:76.6480, incident_date:'2024-06-03' },

  // Mangaluru (Dakshina Kannada)
  { id:23, title:'Robbery — Hampankatta',            fir_number:'FIR/KA/DK/2024/001', status:'filed',               latitude:12.8698, longitude:74.8431, incident_date:'2024-01-30' },
  { id:24, title:'Drug Trafficking — Port Area',     fir_number:'FIR/KA/DK/2024/002', status:'under_investigation', latitude:12.9141, longitude:74.8560, incident_date:'2024-02-17' },
  { id:25, title:'Assault — Kadri',                  fir_number:'FIR/KA/DK/2024/003', status:'closed_true',         latitude:12.8800, longitude:74.8600, incident_date:'2024-03-22' },
  { id:26, title:'Vehicle Theft — Bejai',            fir_number:'FIR/KA/DK/2024/004', status:'filed',               latitude:12.8750, longitude:74.8500, incident_date:'2024-04-18' },
  { id:27, title:'Cyber Fraud — Mangaluru',          fir_number:'FIR/KA/DK/2024/005', status:'filed',               latitude:12.8700, longitude:74.8400, incident_date:'2024-05-25' },

  // Hubballi-Dharwad
  { id:28, title:'Robbery — Hubballi Old Town',      fir_number:'FIR/KA/DW/2024/001', status:'under_investigation', latitude:15.3647, longitude:75.1240, incident_date:'2024-02-03' },
  { id:29, title:'Murder — Dharwad',                 fir_number:'FIR/KA/DW/2024/002', status:'under_investigation', latitude:15.4589, longitude:75.0078, incident_date:'2024-03-09' },
  { id:30, title:'Drug Possession — Hubballi',       fir_number:'FIR/KA/DW/2024/003', status:'filed',               latitude:15.3500, longitude:75.1350, incident_date:'2024-04-14' },
  { id:31, title:'Theft — Vidyanagar',               fir_number:'FIR/KA/DW/2024/004', status:'closed_true',         latitude:15.3700, longitude:75.1100, incident_date:'2024-05-20' },

  // Belagavi
  { id:32, title:'Dacoity — Belagavi Highway',       fir_number:'FIR/KA/BG/2024/001', status:'under_investigation', latitude:15.8497, longitude:74.4977, incident_date:'2024-01-12' },
  { id:33, title:'Assault — Camp Area',              fir_number:'FIR/KA/BG/2024/002', status:'filed',               latitude:15.8600, longitude:74.5100, incident_date:'2024-03-28' },
  { id:34, title:'Robbery — Tilakwadi',              fir_number:'FIR/KA/BG/2024/003', status:'filed',               latitude:15.8400, longitude:74.5200, incident_date:'2024-05-06' },

  // Kalaburagi
  { id:35, title:'Murder — Kalaburagi',              fir_number:'FIR/KA/KL/2024/001', status:'under_investigation', latitude:17.3297, longitude:76.8343, incident_date:'2024-02-22' },
  { id:36, title:'Drug Trafficking — Gulbarga',      fir_number:'FIR/KA/KL/2024/002', status:'filed',               latitude:17.3400, longitude:76.8200, incident_date:'2024-04-30' },

  // Shivamogga
  { id:37, title:'Robbery — Shivamogga Market',      fir_number:'FIR/KA/SM/2024/001', status:'filed',               latitude:13.9299, longitude:75.5681, incident_date:'2024-03-17' },
  { id:38, title:'Assault — Bhadravati',             fir_number:'FIR/KA/SM/2024/002', status:'closed_true',         latitude:13.8500, longitude:75.7000, incident_date:'2024-05-08' },

  // Tumakuru
  { id:39, title:'Vehicle Theft — Tumakuru',         fir_number:'FIR/KA/TK/2024/001', status:'filed',               latitude:13.3379, longitude:77.1173, incident_date:'2024-04-11' },
  { id:40, title:'Cheating — Tumakuru',              fir_number:'FIR/KA/TK/2024/002', status:'filed',               latitude:13.3300, longitude:77.1200, incident_date:'2024-06-01' },

  // Ballari
  { id:41, title:'Robbery — Ballari',                fir_number:'FIR/KA/BL/2024/001', status:'under_investigation', latitude:15.1394, longitude:76.9214, incident_date:'2024-02-14' },
  { id:42, title:'Drug Possession — Hospet',         fir_number:'FIR/KA/BL/2024/002', status:'filed',               latitude:15.2700, longitude:76.3900, incident_date:'2024-05-03' },

  // Raichur
  { id:43, title:'Dacoity — Raichur',                fir_number:'FIR/KA/RC/2024/001', status:'under_investigation', latitude:16.2120, longitude:77.3566, incident_date:'2024-03-05' },

  // Vijayapura
  { id:44, title:'Murder — Vijayapura',              fir_number:'FIR/KA/VP/2024/001', status:'under_investigation', latitude:16.8302, longitude:75.7100, incident_date:'2024-04-19' },
  { id:45, title:'Robbery — Bijapur',                fir_number:'FIR/KA/VP/2024/002', status:'filed',               latitude:16.8400, longitude:75.7200, incident_date:'2024-06-10' },

  // Hassan
  { id:46, title:'Theft — Hassan',                   fir_number:'FIR/KA/HS/2024/001', status:'closed_true',         latitude:13.0033, longitude:76.1004, incident_date:'2024-02-26' },

  // Udupi
  { id:47, title:'Robbery — Udupi',                  fir_number:'FIR/KA/UD/2024/001', status:'filed',               latitude:13.3409, longitude:74.7421, incident_date:'2024-03-31' },

  // Chikkamagaluru
  { id:48, title:'Assault — Chikkamagaluru',         fir_number:'FIR/KA/CM/2024/001', status:'filed',               latitude:13.3161, longitude:75.7720, incident_date:'2024-05-15' },

  // Mandya
  { id:49, title:'Vehicle Theft — Mandya',           fir_number:'FIR/KA/MD/2024/001', status:'filed',               latitude:12.5218, longitude:76.8951, incident_date:'2024-04-27' },

  // Davanagere
  { id:50, title:'Drug Trafficking — Davanagere',    fir_number:'FIR/KA/DV/2024/001', status:'under_investigation', latitude:14.4644, longitude:75.9218, incident_date:'2024-06-08' },
]

const HOTSPOTS = [
  { latitude:12.9698, longitude:77.7499, intensity:8,  radius_km:1.2 }, // Whitefield cluster
  { latitude:12.3052, longitude:76.6552, intensity:6,  radius_km:1.0 }, // Mysuru Palace area
  { latitude:12.9763, longitude:77.5929, intensity:5,  radius_km:0.9 }, // Bengaluru Central
  { latitude:15.3647, longitude:75.1240, intensity:4,  radius_km:0.8 }, // Hubballi
  { latitude:12.8698, longitude:74.8431, intensity:4,  radius_km:0.7 }, // Mangaluru
  { latitude:17.3297, longitude:76.8343, intensity:3,  radius_km:0.6 }, // Kalaburagi
]

export default function AnalystHeatmaps() {
  const [sliderIdx, setSliderIdx] = useState(null)
  const [playing,   setPlaying]   = useState(false)
  const intervalRef = useRef(null)

  const monthBuckets = MONTHS.map((m, mi) => {
    const filtered = KARNATAKA_CRIMES.filter((c) => {
      if (!c.incident_date) return false
      return new Date(c.incident_date).getMonth() === mi
    })
    return { label: m, crimes: filtered }
  }).filter((b) => b.crimes.length > 0)

  const displayCrimes = sliderIdx !== null && monthBuckets[sliderIdx]
    ? monthBuckets[sliderIdx].crimes
    : KARNATAKA_CRIMES

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
        action={
          <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs">
            {KARNATAKA_CRIMES.length} incidents mapped
          </span>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Incidents', value: KARNATAKA_CRIMES.length },
          { label: 'Active Hotspots', value: HOTSPOTS.length },
          { label: 'Districts Covered', value: 14 },
          { label: 'Under Investigation', value: KARNATAKA_CRIMES.filter(c => c.status === 'under_investigation').length },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-white">Crime Density Map — Karnataka</p>
          <span className="text-xs text-slate-500">
            {sliderIdx !== null ? monthBuckets[sliderIdx]?.label : 'All months'}
            {sliderIdx !== null && (
              <span className="ml-1 text-slate-600">· {displayCrimes.length} incidents</span>
            )}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Incident locations and hotspot clusters across Karnataka</p>

        {/* Time slider */}
        {monthBuckets.length > 1 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  playing
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                    : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
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
                  onClick={() => setSliderIdx(i)}
                  className={`text-[9px] cursor-pointer transition-colors ${
                    sliderIdx === i ? 'text-blue-400 font-bold' : 'text-slate-700 hover:text-slate-400'
                  }`}
                >{b.label}</span>
              ))}
            </div>
          </div>
        )}

        <CrimeMap
          crimes={displayCrimes}
          hotspots={HOTSPOTS}
          center={[14.5, 76.5]}
          zoom={7}
        />
      </div>

      {/* Legend */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-white mb-3">Map Legend</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Crime Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-60" />
            <span>High Intensity Hotspot (5+ incidents)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 opacity-60" />
            <span>Medium Intensity Hotspot</span>
          </div>
        </div>
      </div>
    </div>
  )
}
