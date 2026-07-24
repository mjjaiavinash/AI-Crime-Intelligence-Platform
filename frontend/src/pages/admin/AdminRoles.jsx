import PageHeader from '@/components/common/PageHeader'
import Badge from '@/components/common/Badge'

const ROLES = [
  { role: 'admin',        label: 'Administrator', color: 'bg-red-600',    desc: 'Full system access. Manages users, roles, and configuration.', permissions: ['User Management', 'Role Management', 'District Management', 'System Settings', 'Audit Logs', 'All Reports'] },
  { role: 'supervisor',   label: 'Supervisor',    color: 'bg-amber-600',  desc: 'State-level oversight. Views performance and strategic data.', permissions: ['State Overview', 'High Risk Districts', 'Officer Performance', 'Resource Allocation', 'AI Insights', 'Strategic Reports'] },
  { role: 'investigator', label: 'Investigator',  color: 'bg-blue-600',   desc: 'Case-level access. Manages FIRs, suspects, and evidence.', permissions: ['My Cases', 'FIR Management', 'Victims', 'Suspects', 'Evidence', 'AI Assistant', 'Criminal Network', 'Timeline'] },
  { role: 'crime_analyst',label: 'Crime Analyst', color: 'bg-emerald-600',desc: 'Analytics and ML predictions. No case editing access.', permissions: ['Crime Trends', 'Heatmaps', 'District Analytics', 'Crime Forecasting', 'ML Predictions', 'Network Analysis'] },
]

export default function AdminRoles() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Role Management" subtitle="Platform roles and their permissions" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map(({ role, label, color, desc, permissions }) => (
          <div key={role} className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center text-white font-bold text-sm`}>
                {label[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((p) => (
                <span key={p} className="text-xs px-2 py-0.5 rounded bg-surface-300 text-slate-400 border border-slate-700/50">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
