import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'

const SEV = {
  critical: { bar: 'bg-red-500',    text: 'text-red-400',    badge: 'bg-red-500/15 border-red-500/30 text-red-400',       dot: 'bg-red-500'    },
  high:     { bar: 'bg-orange-500', text: 'text-orange-400', badge: 'bg-orange-500/15 border-orange-500/30 text-orange-400', dot: 'bg-orange-500' },
  medium:   { bar: 'bg-yellow-500', text: 'text-yellow-400', badge: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400', dot: 'bg-yellow-500' },
}

const TYPE_ICON = {
  repeat:  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  hotspot: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  gang:    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  pattern: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
}

export default function EarlyWarningAlerts({ maxItems = 5 }) {
  const [alerts, setAlerts]       = useState([])
  const [dismissed, setDismissed] = useState(new Set())
  const [pulse, setPulse]         = useState(true)

  useEffect(() => {
    api.get('/analytics/alerts')
      .then(res => {
        setAlerts(res.data)
        const toNotify = res.data.filter(a => a.severity === 'critical' || a.severity === 'high')
        toNotify.forEach((alert, i) => {
          setTimeout(() => {
            toast(
              <div className="flex items-start gap-2">
                <span className={`text-xs font-bold mt-0.5 ${alert.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>⚠</span>
                <div>
                  <p className="text-xs font-bold text-white">{alert.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{alert.district}</p>
                </div>
              </div>,
              {
                duration: 5000,
                style: {
                  background: alert.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
                  border: alert.severity === 'critical' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(249,115,22,0.4)',
                  color: '#e2e8f0',
                  fontSize: 13,
                },
              }
            )
          }, i * 1200)
        })
      })
      .catch(() => setAlerts([]))
    const t = setTimeout(() => setPulse(false), 3000)
    return () => clearTimeout(t)
  }, [])

  const visible = alerts.filter(a => !dismissed.has(a.id)).slice(0, maxItems)
  const criticalCount = visible.filter(a => a.severity === 'critical').length

  return (
    <div className="rounded-xl border border-slate-700/50 bg-surface-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full bg-red-500 ${pulse ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-bold text-white">Early Warning Alerts</span>
          {criticalCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 font-bold">
              {criticalCount} CRITICAL
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500">{visible.length} active</span>
      </div>

      <div className="divide-y divide-slate-700/30">
        {visible.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">No active alerts</div>
        ) : (
          visible.map((alert) => {
            const s = SEV[alert.severity] || SEV.medium
            return (
              <div key={alert.id} className="flex gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group">
                <div className={`w-0.5 rounded-full self-stretch ${s.bar} shrink-0`} />
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${s.badge} border`}>
                  {TYPE_ICON[alert.type] || TYPE_ICON.pattern}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white">{alert.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wide ${s.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{alert.desc}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-600">{alert.district}</span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-600">{alert.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => setDismissed(p => new Set([...p, alert.id]))}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-600 hover:text-slate-300"
                  title="Dismiss">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
