const variants = {
  open:                'bg-accent/15 text-accent-300 border border-accent/30',
  filed:               'bg-accent/15 text-accent-300 border border-accent/30',
  closed:              'bg-success/15 text-emerald-300 border border-success/30',
  closed_true:         'bg-success/15 text-emerald-300 border border-success/30',
  closed_false:        'bg-slate-700/50 text-slate-400 border border-slate-600/50',
  under_investigation: 'bg-warning/15 text-amber-300 border border-warning/30',
  charge_sheet_filed:  'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  referred_to_court:   'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  default:             'bg-slate-700/50 text-slate-300 border border-slate-600/50',
  info:                'bg-info/15 text-blue-300 border border-info/30',
  admin:               'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  supervisor:          'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  investigator:        'bg-primary-500/15 text-primary-300 border border-primary-500/30',
  crime_analyst:       'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
}

export default function Badge({ label, variant = 'default' }) {
  return (
    <span className={`badge ${variants[variant] ?? variants.default}`}>
      {label}
    </span>
  )
}
