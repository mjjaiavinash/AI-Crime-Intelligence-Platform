export default function PageHeader({ title, subtitle, action, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Accent bar */}
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 flex-shrink-0 mt-0.5 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">{title}</h1>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wide">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  )
}
