import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { getCrimeColor } from '@/utils/helpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1 capitalize">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} incidents</p>
    </div>
  )
}

export default function CrimeBarChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" vertical={false} />
        <XAxis dataKey="crime_type" tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30,58,95,0.2)' }} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getCrimeColor(entry.crime_type)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
