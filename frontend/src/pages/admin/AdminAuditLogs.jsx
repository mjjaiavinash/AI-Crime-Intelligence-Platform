import { useEffect, useState } from 'react'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Spinner from '@/components/common/Spinner'

const ACTION_COLOR = {
  POST:   'text-success',
  GET:    'text-blue-400',
  PATCH:  'text-yellow-400',
  DELETE: 'text-accent-400',
  PUT:    'text-purple-400',
}

// Parse log lines from backend app.log format
function parseLogs(text) {
  if (!text) return []
  return text.split('\n')
    .filter((l) => l.includes('|') && (l.includes('POST') || l.includes('GET') || l.includes('PATCH') || l.includes('DELETE') || l.includes('Login:')))
    .slice(-50)
    .reverse()
    .map((line, i) => {
      const parts = line.split('|').map((p) => p.trim())
      const ts    = parts[0] || ''
      const level = parts[1] || ''
      const msg   = parts[3] || parts[2] || ''
      const method = ['POST','GET','PATCH','DELETE','PUT'].find((m) => msg.includes(m)) || 'INFO'
      return { id: i, ts, level, msg, method }
    })
}

export default function AdminAuditLogs() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch recent auth activity from users endpoint as a proxy for audit trail
    api.get('/auth/users').then((r) => {
      // Build synthetic audit entries from user data
      const entries = r.data.map((u, i) => ({
        id:       i + 1,
        ts:       u.last_login_at ? new Date(u.last_login_at).toLocaleString() : u.created_at,
        user:     u.username,
        action:   u.last_login_at ? 'LOGIN' : 'USER_CREATED',
        resource: `User #${u.id}`,
        role:     u.role,
      }))
      setLogs(entries)
    }).finally(() => setLoading(false))
  }, [])

  const ACTION_STYLE = {
    LOGIN:        'text-blue-400',
    USER_CREATED: 'text-success',
    ROLE_CHANGED: 'text-yellow-400',
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Logs"
        subtitle="User activity and system events"
        action={!loading && <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">{logs.length} entries</span>}
      />
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-white">Activity Log</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['#', 'Time', 'User', 'Action', 'Resource', 'Role'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((r) => (
                <tr key={r.id} className="border-b border-slate-700/30 hover:bg-surface-300/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-slate-500 text-xs">#{r.id}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.ts || '—'}</td>
                  <td className="px-5 py-3 font-medium text-white">{r.user}</td>
                  <td className="px-5 py-3"><span className={`font-mono text-xs font-semibold ${ACTION_STYLE[r.action] ?? 'text-slate-300'}`}>{r.action}</span></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{r.resource}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs capitalize">{r.role?.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
