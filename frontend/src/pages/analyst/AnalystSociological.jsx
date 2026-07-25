import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#e63946', '#3b82f6', '#8b5cf6', '#ec4899']

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a2235', border: '1px solid #334155', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  )
}

export default function AnalystSociological() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/sociological')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>
  if (!data)   return <div className="text-center py-24 text-slate-500">Failed to load sociological data.</div>

  const topGender  = data.gender_split?.[0]
  const totalSus   = data.total_suspects || 1
  const maleCount  = data.gender_split?.find((g) => g.name?.toLowerCase() === 'male')?.value ?? 0
  const youthCount = (data.age_groups?.[0]?.count ?? 0) + (data.age_groups?.[1]?.count ?? 0)
  const topDistrict = data.by_district?.[0]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Sociological Insights"
        subtitle="Demographic and socioeconomic crime pattern analysis — real DB data"
        action={<span className="badge bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs">Live Data</span>}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Suspects',    value: data.total_suspects,  sub: 'Registered in DB' },
          { label: 'Total Victims',     value: data.total_victims,   sub: 'Across all FIRs' },
          { label: 'Known Criminals',   value: data.known_criminals, sub: `${Math.round(data.known_criminals / totalSus * 100)}% of suspects` },
          { label: 'Recidivism Rate',   value: `${data.repeat_rate}%`, sub: 'Suspects with 2+ FIRs' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Age Group Bar */}
        <ChartCard title="Suspect Age Distribution" subtitle="Crimes by estimated suspect age group">
          {data.age_groups?.every((g) => g.count === 0) ? (
            <p className="text-xs text-slate-500 py-8 text-center">No age data recorded for suspects yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.age_groups} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Suspects" radius={[4, 4, 0, 0]}>
                  {data.age_groups.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Gender Pie */}
        <ChartCard title="Suspect Gender Distribution" subtitle="Based on registered suspect records">
          {!data.gender_split?.length ? (
            <p className="text-xs text-slate-500 py-8 text-center">No gender data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.gender_split} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} innerRadius={45} paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {data.gender_split.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Recidivism stacked bar */}
        <ChartCard title="Recidivism Trend" subtitle="Repeat vs first-time offenders by month">
          {!data.recidivism?.length ? (
            <p className="text-xs text-slate-500 py-8 text-center">No trend data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.recidivism} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Bar dataKey="repeat"     name="Repeat Offender" stackId="a" fill="#e63946" radius={[0,0,0,0]} />
                <Bar dataKey="first_time" name="First-Time"      stackId="a" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* District bar */}
        <ChartCard title="Crimes by District" subtitle="Top districts by FIR count">
          {!data.by_district?.length ? (
            <p className="text-xs text-slate-500 py-8 text-center">No district data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.by_district} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="zone" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="crimes" name="FIRs" radius={[0, 4, 4, 0]}>
                  {data.by_district.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Victim injury radar */}
        {data.injury_types?.length > 0 && (
          <ChartCard title="Victim Injury Severity" subtitle="Distribution of injury types across victims">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={data.injury_types} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 9 }} />
                <Radar name="Victims" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                <Tooltip {...TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Key findings */}
        <ChartCard title="Key Sociological Findings" subtitle="Derived from live database records">
          <ul className="space-y-3 mt-1">
            {[
              maleCount > 0 && { icon: '♂', text: `Male suspects account for ${Math.round(maleCount / totalSus * 100)}% of all registered suspects (${maleCount} of ${totalSus}).` },
              youthCount > 0 && { icon: '👥', text: `Youth offenders (15–34) represent ${Math.round(youthCount / totalSus * 100)}% of suspects with recorded age data.` },
              data.repeat_rate > 0 && { icon: '🔁', text: `${data.repeat_rate}% recidivism rate — suspects linked to 2 or more FIRs.` },
              data.known_criminals > 0 && { icon: '📋', text: `${data.known_criminals} suspects flagged as known criminals with prior records.` },
              topDistrict && { icon: '📍', text: `${topDistrict.zone} is the highest crime district with ${topDistrict.crimes} recorded FIRs.` },
            ].filter(Boolean).map(({ icon, text }) => (
              <li key={text} className="flex gap-3 text-xs text-slate-400 leading-relaxed">
                <span className="text-base shrink-0">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
            {!maleCount && !youthCount && !data.repeat_rate && (
              <li className="text-xs text-slate-500">Add suspects and victims to generate sociological insights.</li>
            )}
          </ul>
        </ChartCard>

      </div>
    </div>
  )
}
