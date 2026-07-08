export default function StatCard({ title, value, icon, trend, trendLabel, accent = false }) {
  const isUp = trend > 0
  return (
    <div className={`card p-5 flex flex-col gap-3 animate-fade-in ${accent ? 'border-accent/30 shadow-glow-accent' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg ${accent ? 'bg-accent/10 text-accent' : 'bg-primary-500/10 text-primary-300'}`}>
          {icon}
        </div>
      </div>

      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${isUp ? 'text-accent-400' : 'text-success'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500">{trendLabel ?? 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}
