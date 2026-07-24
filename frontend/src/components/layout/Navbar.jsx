import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

const BREADCRUMBS = {
  '/dashboard':                     ['Intelligence', 'Dashboard'],
  '/analytics':                     ['Intelligence', 'Analytics'],
  '/reports':                       ['Intelligence', 'AI Reports'],
  '/admin/dashboard':               ['Admin', 'Dashboard'],
  '/admin/users':                   ['Admin', 'Users'],
  '/admin/roles':                   ['Admin', 'Roles'],
  '/admin/districts':               ['Admin', 'Districts'],
  '/admin/stations':                ['Admin', 'Stations'],
  '/admin/crime-types':             ['Admin', 'Crime Types'],
  '/admin/settings':                ['Admin', 'Settings'],
  '/admin/audit-logs':              ['Admin', 'Audit Logs'],
  '/admin/reports':                 ['Admin', 'Reports'],
  '/analyst/dashboard':             ['Analyst', 'Dashboard'],
  '/analyst/trends':                ['Analyst', 'Trends'],
  '/analyst/heatmaps':              ['Analyst', 'Heatmaps'],
  '/analyst/districts':             ['Analyst', 'Districts'],
  '/analyst/forecasting':           ['Analyst', 'Forecasting'],
  '/analyst/ml':                    ['Analyst', 'ML Predictions'],
  '/analyst/network':               ['Analyst', 'Network'],
  '/analyst/sociological':          ['Analyst', 'Sociological'],
  '/analyst/reports':               ['Analyst', 'Reports'],
  '/investigator/dashboard':        ['Investigator', 'Dashboard'],
  '/investigator/cases':            ['Investigator', 'Cases'],
  '/investigator/fir':              ['Investigator', 'FIR'],
  '/investigator/victims':          ['Investigator', 'Victims'],
  '/investigator/suspects':         ['Investigator', 'Suspects'],
  '/investigator/evidence':         ['Investigator', 'Evidence'],
  '/investigator/assistant':        ['Investigator', 'AI Assistant'],
  '/investigator/suspect-profile':  ['Investigator', 'Suspect Profile'],
  '/investigator/network':          ['Investigator', 'Network'],
  '/investigator/financial-network':['Investigator', 'Financial Network'],
  '/investigator/timeline':         ['Investigator', 'Timeline'],
  '/investigator/reports':          ['Investigator', 'Reports'],
  '/supervisor/dashboard':          ['Supervisor', 'Dashboard'],
  '/supervisor/state':              ['Supervisor', 'State Overview'],
  '/supervisor/high-risk':          ['Supervisor', 'High Risk'],
  '/supervisor/officers':           ['Supervisor', 'Officers'],
  '/supervisor/resources':          ['Supervisor', 'Resources'],
  '/supervisor/insights':           ['Supervisor', 'Insights'],
  '/supervisor/reports':            ['Supervisor', 'Reports'],
}

const NOTIFICATIONS = [
  { msg: 'New crime report filed in Sector 4', time: '2m ago',  dot: 'bg-red-400',     type: 'alert' },
  { msg: 'AI report generation complete',      time: '15m ago', dot: 'bg-emerald-400', type: 'success' },
  { msg: 'Suspect match found via RAG query',  time: '1h ago',  dot: 'bg-blue-400',    type: 'info' },
]

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [time, setTime]       = useState(new Date())
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const crumbs = BREADCRUMBS[pathname] ?? ['Platform']

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-5
                       bg-surface-50/90 backdrop-blur-xl border-b border-slate-700/40 flex-shrink-0 relative z-10">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="w-3 h-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <span className={
                i === crumbs.length - 1
                  ? 'text-white font-semibold'
                  : 'text-slate-500 hidden sm:inline text-xs'
              }>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 md:gap-2">

        {/* Live clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400
                        bg-surface-300/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
            <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-76 w-[300px] rounded-xl border border-slate-700/50 bg-surface-200/95 backdrop-blur-xl shadow-2xl shadow-black/60 z-50 animate-slide-in overflow-hidden"
                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.6)' }}>
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-bold">
                    {NOTIFICATIONS.length} new
                  </span>
                </div>
                {NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04]
                                          transition-colors cursor-pointer border-b border-slate-700/30 last:border-0">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{n.msg}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2.5 border-t border-slate-700/50">
                  <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    View all notifications →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-slate-700/60 mx-1" />

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800
                          flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0
                          ring-2 ring-primary-500/20">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-tight">{user?.username ?? 'Officer'}</p>
            <p className="text-[10px] text-slate-500 leading-tight capitalize">{user?.role?.replace('_', ' ') ?? 'officer'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
