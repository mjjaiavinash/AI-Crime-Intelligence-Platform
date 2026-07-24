import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { login, getMe } from '@/services/authService'
import Spinner from '@/components/common/Spinner'

export default function LoginPage() {
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [focused, setFocused] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [error,   setError]   = useState('')
  const { setAuth, setUser }  = useAuthStore()
  const navigate              = useNavigate()

  useEffect(() => { setMounted(true) }, [])



  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please fill in both username and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await login(form)
      setAuth(null, data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      const me = await getMe()
      setUser(me.data)
      toast.success(`Welcome back, ${me.data.username}!`)
      const role = me.data.role
      if (role === 'admin')              navigate('/admin/dashboard')
      else if (role === 'crime_analyst') navigate('/analyst/dashboard')
      else if (role === 'supervisor')    navigate('/supervisor/dashboard')
      else                               navigate('/investigator/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.detail ?? ''
      if (err.response?.status === 401) {
        if (typeof msg === 'string' && msg.toLowerCase().includes('disabled')) {
          setError('Your account has been disabled. Contact your administrator.')
        } else {
          setError('Wrong password. Please try again.')
        }
      } else {
        setError('Login failed. Please check your credentials and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      {/* ── Full-page background image ── */}
      <img
        src="/Background_image.png"
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
      />

      {/* ── Dark overlay to ensure readability ── */}
      <div className="absolute inset-0 bg-black/55" />

      {/* ── Subtle vignette edges ── */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

      {/* ── Top bar — branding strip ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-extrabold text-white tracking-wide leading-none">CrimeIQ</p>
            <p className="text-[9px] text-blue-300/70 uppercase tracking-[0.3em] leading-none mt-0.5">Intelligence Platform</p>
          </div>
        </div>


      </div>

      {/* ── Centered login card ── */}
      <div
        className={`relative z-10 w-full max-w-[480px] mx-4 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Card */}
        <div
          className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(5,10,20,0.85) 0%, rgba(10,16,32,0.80) 100%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent rounded-full" />

          {/* Card header */}
          <div className="mb-5 text-center">
            <h1 className="text-xl font-black tracking-tight text-white">Welcome Back</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 animate-slide-in">
                <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Username field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                Username
              </label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                focused === 'username'
                  ? 'border-blue-500/60 bg-blue-500/[0.08] shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
                  : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14]'
              }`}>
                <svg className={`w-4 h-4 shrink-0 transition-colors ${focused === 'username' ? 'text-blue-400' : 'text-slate-600'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => { setForm({ ...form, username: e.target.value }); setError('') }}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                Password
              </label>
              <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                focused === 'password'
                  ? 'border-blue-500/60 bg-blue-500/[0.08] shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
                  : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14]'
              }`}>
                <svg className={`w-4 h-4 shrink-0 transition-colors ${focused === 'password' ? 'text-blue-400' : 'text-slate-600'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setError('') }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="text-slate-600 hover:text-slate-300 transition-colors shrink-0">
                  {showPw
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white mt-1 flex items-center justify-center gap-2.5 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1d4ed8 100%)',
                boxShadow: loading ? 'none' : '0 4px 32px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {loading && <Spinner size="sm" />}
              <span className="relative">{loading ? 'Authenticating…' : 'Access Platform'}</span>
              {!loading && (
                <svg className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </form>


        </div>


      </div>

      {/* ── Bottom gradient fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  )
}
