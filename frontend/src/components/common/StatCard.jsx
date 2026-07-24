export default function StatCard({ title, value, icon, trend, trendLabel, accent = false, color = 'blue' }) {
  const isUp = trend > 0

  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20' },
    red:    { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
    green:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
    purple: { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20' },
  }

  const c = colorMap[accent ? 'red' : color] ?? colorMap.blue

  return (
    <div className={`
      relative overflow-hidden rounded-xl border p-5 flex flex-col gap-3
      bg-surface-200 transition-all duration-200 hover:bg-surface-300 hover:-translate-y-0.5
      animate-fade-in group cursor-default
      ${accent ? 'border-red-500/20 shadow-[0_4px_24px_rgba(230,57,70,0.1)]' : 'border-slate-700/50 shadow-card'}
    `}>
      {/* Subtle top gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-px ${accent ? 'bg-gradient-to-r from-transparent via-red-500/40 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/20 to-transparent'}`} />

      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 leading-tight">{title}</span>
        <div className={`p-2 rounded-lg flex-shrink-0 ${c.bg} ${c.text} border ${c.border} transition-transform duration-200 group-hover:scale-110`}>
          {icon ?? <DefaultIcon />}
        </div>
      </div>

      <div className="text-3xl font-black text-white tracking-tight tabular-nums">{value}</div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md ${
            isUp
              ? 'text-red-400 bg-red-500/10'
              : 'text-emerald-400 bg-emerald-500/10'
          }`}>
            {isUp ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-600">{trendLabel ?? 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}

function DefaultIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
