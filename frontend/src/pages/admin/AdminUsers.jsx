import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'
import Spinner from '@/components/common/Spinner'

const ROLE_OPTIONS = [
  { value: 'investigator',  label: 'Investigator',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { value: 'crime_analyst', label: 'Crime Analyst', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { value: 'supervisor',    label: 'Supervisor',    color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { value: 'admin',         label: 'Admin',         color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
]

const EMPTY = { username: '', email: '', full_name: '', role: 'investigator', password: '' }

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)                        score++
  if (pw.length >= 12)                       score++
  if (/[A-Z]/.test(pw))                      score++
  if (/[0-9]/.test(pw))                      score++
  if (/[^A-Za-z0-9]/.test(pw))              score++
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' }
  if (score <= 3) return { score, label: 'Fair',   color: 'bg-amber-500' }
  if (score === 4) return { score, label: 'Good',  color: 'bg-blue-500' }
  return { score, label: 'Strong', color: 'bg-emerald-500' }
}

function COLUMNS(onToggle, onEdit) {
  return [
    { key: 'id',        label: '#',       render: (r) => <span className="font-mono text-slate-600 text-xs">#{r.id}</span> },
    { key: 'username',  label: 'Username', render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {r.username[0].toUpperCase()}
        </div>
        <span className="font-semibold text-white">{r.username}</span>
      </div>
    )},
    { key: 'full_name', label: 'Name',    render: (r) => <span className="text-slate-300">{r.full_name || '—'}</span> },
    { key: 'email',     label: 'Email',   render: (r) => <span className="text-slate-500 text-xs">{r.email}</span> },
    { key: 'role',      label: 'Role',    render: (r) => <Badge label={r.role.replace('_', ' ')} variant={r.role} /> },
    { key: 'is_active', label: 'Status',  render: (r) => (
      <span className={`badge ${r.is_active
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-slate-700/50 text-slate-500 border border-slate-600/30'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${r.is_active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
        {r.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: '', render: (r) => (
      <div className="flex items-center gap-2">
        <button onClick={() => onToggle(r)}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
            r.is_active
              ? 'text-red-400 border-red-500/20 bg-red-500/10 hover:bg-red-500/20'
              : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20'
          }`}>
          {r.is_active ? 'Disable' : 'Enable'}
        </button>
      </div>
    )},
  ]
}

export default function AdminUsers() {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [showPw,     setShowPw]     = useState(false)
  const [errors,     setErrors]     = useState({})

  const load = () => {
    setLoading(true)
    api.get('/auth/users').then((r) => setUsers(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }))
    setErrors((p) => ({ ...p, [k]: '' }))
  }

  const openModal = (defaultRole = 'investigator') => {
    setForm({ ...EMPTY, role: defaultRole })
    setErrors({})
    setShowPw(false)
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.username || form.username.length < 3) e.username = 'Min. 3 characters'
    if (!form.email || !form.email.includes('@'))   e.email    = 'Valid email required'
    if (!form.password || form.password.length < 8) e.password = 'Min. 8 characters'
    if (!/[A-Z]/.test(form.password))               e.password = 'Must contain uppercase letter'
    if (!/[0-9]/.test(form.password))               e.password = 'Must contain a number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post('/auth/register', form)
      toast.success(`User "${form.username}" created successfully!`)
      setModalOpen(false)
      setForm(EMPTY)
      load()
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.response?.data?.error ?? 'Failed to create user.'
      toast.error(typeof msg === 'string' ? msg : msg[0]?.msg ?? 'Validation error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (user) => {
    try {
      await api.patch(`/auth/users/${user.id}/${user.is_active ? 'deactivate' : 'activate'}`)
      toast.success(`User ${user.is_active ? 'disabled' : 'enabled'}.`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Action failed.')
    }
  }

  const pwStrength  = getPasswordStrength(form.password)
  const active      = users.filter((u) => u.is_active).length
  const admins      = users.filter((u) => u.role === 'admin').length
  const analysts    = users.filter((u) => u.role === 'crime_analyst').length
  const selectedRole = ROLE_OPTIONS.find((r) => r.value === form.role)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="User Management"
        subtitle="Manage platform users, roles and access control"
        action={
          <button onClick={() => openModal('investigator')} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',   value: users.length, color: 'text-blue-400',    icon: '👥' },
          { label: 'Active',        value: active,       color: 'text-emerald-400', icon: '✅' },
          { label: 'Admins',        value: admins,       color: 'text-red-400',     icon: '🛡️' },
          { label: 'Analysts',      value: analysts,     color: 'text-emerald-400', icon: '📊' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 hover:bg-surface-300 transition-colors">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">All Users</p>
            <p className="text-xs text-slate-500 mt-0.5">{users.length} registered accounts</p>
          </div>
        </div>
        {loading
          ? <div className="flex justify-center py-12"><Spinner /></div>
          : <Table columns={COLUMNS(handleToggle)} data={users} loading={false} />
        }
      </div>

      {/* Add User Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New User" size="md">
        <form onSubmit={handleCreate} className="space-y-4">

          {/* Role selector — visual pills */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button key={r.value} type="button"
                  onClick={() => set('role', r.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    form.role === r.value
                      ? `${r.bg} ${r.color} ${r.border} shadow-sm`
                      : 'border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${form.role === r.value ? r.color.replace('text-', 'bg-') : 'bg-slate-600'}`} />
                  {r.label}
                  {r.value === 'admin' && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20 font-bold">
                      PRIVILEGED
                    </span>
                  )}
                </button>
              ))}
            </div>
            {(form.role === 'admin' || form.role === 'supervisor') && (
              <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[11px] text-amber-300 leading-relaxed">
                  {form.role === 'admin'
                    ? 'Admin accounts have full platform access including user management.'
                    : 'Supervisor accounts can manage investigations and view all data.'}
                </p>
              </div>
            )}
          </div>

          {/* Username + Full Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Username *</label>
              <input className={`input ${errors.username ? 'border-red-500/60 focus:ring-red-500/30' : ''}`}
                placeholder="e.g. john_doe"
                value={form.username}
                onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                required />
              {errors.username && <p className="text-[10px] text-red-400 mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Full Name</label>
              <input className="input" placeholder="Full name"
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Email *</label>
            <input className={`input ${errors.email ? 'border-red-500/60 focus:ring-red-500/30' : ''}`}
              type="email" placeholder="user@crimeiq.local"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required />
            {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">Password *</label>
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
              errors.password ? 'border-red-500/60' : 'border-slate-700 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10'
            } bg-surface-300`}>
              <input
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0">
                {showPw
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
            {/* Password strength bar */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= pwStrength.score ? pwStrength.color : 'bg-slate-700'
                    }`} />
                  ))}
                </div>
                <p className={`text-[10px] font-semibold ${
                  pwStrength.score <= 1 ? 'text-red-400' :
                  pwStrength.score <= 3 ? 'text-amber-400' :
                  pwStrength.score === 4 ? 'text-blue-400' : 'text-emerald-400'
                }`}>{pwStrength.label}</p>
              </div>
            )}
            {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 ${
                form.role === 'admin'
                  ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 shadow-lg shadow-red-500/20'
                  : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 shadow-lg shadow-blue-500/20'
              }`}>
              {submitting ? <><Spinner size="sm" color="white" /> Creating…</> : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create {selectedRole?.label}
                </>
              )}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost px-6">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
