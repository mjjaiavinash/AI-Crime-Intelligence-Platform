import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

const BREADCRUMBS = {
  '/dashboard': ['Intelligence', 'Dashboard'],
  '/analytics': ['Intelligence', 'Analytics'],
  '/reports':   ['Intelligence', 'AI Reports'],
  '/crimes':    ['Management', 'Crime Records'],
  '/admin':     ['Management', 'Admin Panel'],
}

export default function Navbar() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [time, setTime] = useState(new Date())
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const crumbs = BREADCRUMBS[pathname] ?? ['Platform']

  return (
    <header className="h-14 flex items-center justify-between px-6
                       bg-surface-50/80 backdrop-blur border-b border-slate-700/50 flex-shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-600">/</span>}
            <span className={i === crumbs.length - 1
              ? 'text-white font-semibold'
              : 'text-slate-500'}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Live clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500
                        bg-surface-300 px-3 py-1.5 rounded-lg border border-slate-700/50">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white
                       hover:bg-surface-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 card shadow-card z-50 animate-slide-in">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              {[
                { msg: 'New crime report filed in Sector 4', time: '2m ago', dot: 'bg-accent' },
                { msg: 'AI report generation complete',      time: '15m ago', dot: 'bg-success' },
                { msg: 'Suspect match found via RAG query',  time: '1h ago',  dot: 'bg-info' },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-300
                                        transition-colors cursor-pointer border-b border-slate-700/30 last:border-0">
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                  <div>
                    <p className="text-xs text-slate-300">{n.msg}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                          flex items-center justify-center text-xs font-bold text-white shadow-glow">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-tight">{user?.username ?? 'Officer'}</p>
            <p className="text-xs text-slate-500 leading-tight capitalize">{user?.role ?? 'officer'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
