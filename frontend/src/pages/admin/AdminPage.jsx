import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/common/PageHeader'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Modal from '@/components/common/Modal'

const MOCK_USERS = [
  { id: 1, username: 'admin',    email: 'admin@crimeiq.local',    role: 'admin',   is_active: true,  created_at: '2024-01-01' },
  { id: 2, username: 'analyst1', email: 'analyst1@crimeiq.local', role: 'analyst', is_active: true,  created_at: '2024-02-10' },
  { id: 3, username: 'officer1', email: 'officer1@crimeiq.local', role: 'officer', is_active: true,  created_at: '2024-03-05' },
  { id: 4, username: 'officer2', email: 'officer2@crimeiq.local', role: 'officer', is_active: false, created_at: '2024-04-20' },
]

const COLUMNS = [
  { key: 'id',         label: '#',       render: (r) => <span className="font-mono text-slate-500">#{r.id}</span> },
  { key: 'username',   label: 'Username', render: (r) => <span className="font-medium text-white">{r.username}</span> },
  { key: 'email',      label: 'Email',    render: (r) => <span className="text-slate-400 text-xs">{r.email}</span> },
  { key: 'role',       label: 'Role',     render: (r) => <Badge label={r.role} variant={r.role} /> },
  { key: 'is_active',  label: 'Status',   render: (r) => (
    <span className={`badge ${r.is_active
      ? 'bg-success/15 text-emerald-300 border border-success/30'
      : 'bg-slate-700/50 text-slate-500 border border-slate-600/50'}`}>
      {r.is_active ? 'Active' : 'Inactive'}
    </span>
  )},
  { key: 'created_at', label: 'Joined' },
  { key: 'actions',    label: '',         render: (r) => (
    <div className="flex items-center gap-2">
      <button className="text-xs text-primary-300 hover:text-white transition-colors">Edit</button>
      <button className="text-xs text-accent-400 hover:text-accent transition-colors">
        {r.is_active ? 'Disable' : 'Enable'}
      </button>
    </div>
  )},
]

export default function AdminPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', role: 'officer', password: '' })

  const handleCreate = (e) => {
    e.preventDefault()
    toast.success(`User "${form.username}" created.`)
    setModalOpen(false)
    setForm({ username: '', email: '', role: 'officer', password: '' })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Admin Panel"
        subtitle="User management and system configuration"
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        }
      />

      {/* System stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',    value: '4',   color: 'text-primary-300' },
          { label: 'Active Users',   value: '3',   color: 'text-success' },
          { label: 'Admins',         value: '1',   color: 'text-accent-300' },
          { label: 'Analysts',       value: '1',   color: 'text-info' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-white">System Users</p>
          <p className="text-xs text-slate-500 mt-0.5">Manage platform access and roles</p>
        </div>
        <Table columns={COLUMNS} data={MOCK_USERS} loading={false} />
      </div>

      {/* System info */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-4">System Status</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { service: 'FastAPI Backend',  status: 'Operational', color: 'text-success', dot: 'bg-success' },
            { service: 'MySQL Database',   status: 'Operational', color: 'text-success', dot: 'bg-success' },
            { service: 'Groq API',         status: 'Connected',   color: 'text-success', dot: 'bg-success' },
            { service: 'ChromaDB (RAG)',   status: 'Standby',     color: 'text-warning', dot: 'bg-warning' },
            { service: 'ML Models',        status: 'Loaded',      color: 'text-success', dot: 'bg-success' },
            { service: 'File Storage',     status: 'Operational', color: 'text-success', dot: 'bg-success' },
          ].map(({ service, status, color, dot }) => (
            <div key={service} className="flex items-center justify-between
                                          bg-surface-300 rounded-lg px-4 py-3">
              <span className="text-sm text-slate-300">{service}</span>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse-slow`} />
                <span className={`text-xs font-medium ${color}`}>{status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add user modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
              <input className="input" placeholder="username" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
              <select className="input" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="officer">Officer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input className="input" type="email" placeholder="user@crimeiq.local" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input className="input" type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Create User</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
