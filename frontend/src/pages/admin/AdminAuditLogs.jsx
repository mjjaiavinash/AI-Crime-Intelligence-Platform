import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

const ACTION_STYLE = {
  LOGIN:        'text-blue-400 bg-blue-500/10 border-blue-500/20',
  USER_CREATED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  NEVER_LOGGED: 'text-slate-500 bg-slate-700/20 border-slate-600/20',
  INACTIVE:     'text-red-400 bg-red-500/10 border-red-500/20',
}

const ROLE_STYLE = {
  admin:        'text-red-400',
  supervisor:   'text-amber-400',
  investigator: 'text-blue-400',
  crime_analyst:'text-emerald-400',
}

function buildEntries(users) {
  const entries = []
  users.forEach((u) => {
    // Account creation entry
    entries.push({
      id:       `created-${u.id}`,
      ts:       u.created_at ? new Date(u.created_at).toLocaleString() : '—',
      user:     u.username,
      full_name:u.full_name || '—',
      action:   'USER_CREATED',
      resource: `Account created`,
      role:     u.role,
      is_active:u.is_active,
    })
    // Last login entry if available
    if (u.last_login_at) {
      entries.push({
        id:       `login-${u.id}`,
        ts:       new Date(u.last_login_at).toLocaleString(),
        user:     u.username,
        full_name:u.full_name || '—',
        action:   'LOGIN',
        resource: `Last login`,
        role:     u.role,
        is_active:u.is_active,
      })
    } else {
      entries.push({
        id:       `nologin-${u.id}`,
        ts:       '—',
        user:     u.username,
        full_name:u.full_name || '—',
        action:   'NEVER_LOGGED',
        resource: `Never logged in`,
        role:     u.role,
        is_active:u.is_active,
      })
    }
    if (!u.is_active) {
      entries.push({
        id:       `inactive-${u.id}`,
        ts:       '—',
        user:     u.username,
        full_name:u.full_name || '—',
        action:   'INACTIVE',
        resource: `Account disabled`,
        role:     u.role,
        is_active:u.is_active,
      })
    }
  })
  // Sort: created/login entries by ts desc, unknowns last
  return entries.sort((a, b) => {
    if (a.ts === '—') return 1
    if (b.ts === '—') return -1
    return new Date(b.ts) - new Date(a.ts)
  })
}

export default function AdminAuditLogs() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    api.get('/auth/users')
      .then((r) => setUsers(r.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const entries = buildEntries(users)

  const filtered = entries.filter((e) => {
    if (filter !== 'all' && e.action !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return e.user.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.resource.toLowerCase().includes(q)
    }
    return true
  })

  const stats = {
    total:   users.length,
    active:  users.filter((u) => u.is_active).length,
    loggedIn:users.filter((u) => u.last_login_at).length,
    admins:  users.filter((u) => u.role === 'admin').length,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Logs"
        subtitle="User activity, account events and access records"
        action={!loading && <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{entries.length} entries</span>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',    value: stats.total,    color: 'text-white' },
          { label: 'Active',         value: stats.active,   color: 'text-emerald-400' },
          { label: 'Ever Logged In', value: stats.loggedIn, color: 'text-blue-400' },
          { label: 'Admins',         value: stats.admins,   color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-sm font-semibold text-white">Activity Log</p>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              className="input text-xs flex-1 sm:w-48"
              placeholder="Search user, role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input text-xs w-36" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Events</option>
              <option value="LOGIN">Logins</option>
              <option value="USER_CREATED">Created</option>
              <option value="NEVER_LOGGED">Never Logged</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Timestamp', 'Username', 'Full Name', 'Event', 'Detail', 'Role', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">{r.ts}</td>
                    <td className="px-5 py-3 font-semibold text-white text-xs">{r.user}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{r.full_name}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${ACTION_STYLE[r.action] ?? 'text-slate-400'}`}>
                        {r.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{r.resource}</td>
                    <td className="px-5 py-3 text-xs font-semibold capitalize">
                      <span className={ROLE_STYLE[r.role] ?? 'text-slate-400'}>{r.role?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${r.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
