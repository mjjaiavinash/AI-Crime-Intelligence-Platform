import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/common/PageHeader'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    app_name: 'CrimeIQ Intelligence Platform',
    session_timeout: '60',
    max_login_attempts: '5',
    enable_2fa: false,
    enable_audit_log: true,
    groq_model: 'llama3-8b-8192',
    chroma_persist: './database/chromadb',
  })

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Settings saved successfully.')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="System Settings" subtitle="Configure platform-wide settings" />

      <form onSubmit={handleSave} className="space-y-4">
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold text-white border-b border-slate-700/50 pb-3">General</p>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Application Name</label>
            <input className="input" value={settings.app_name} onChange={(e) => setSettings({ ...settings, app_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Session Timeout (min)</label>
              <input className="input" type="number" value={settings.session_timeout} onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Max Login Attempts</label>
              <input className="input" type="number" value={settings.max_login_attempts} onChange={(e) => setSettings({ ...settings, max_login_attempts: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-white">Enable Audit Logging</p>
              <p className="text-xs text-slate-500">Log all user actions to audit trail</p>
            </div>
            <button type="button" onClick={() => setSettings({ ...settings, enable_audit_log: !settings.enable_audit_log })}
              className={`w-10 h-5 rounded-full transition-colors ${settings.enable_audit_log ? 'bg-success' : 'bg-slate-600'}`}>
              <span className={`block w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${settings.enable_audit_log ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold text-white border-b border-slate-700/50 pb-3">AI Configuration</p>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Groq Model</label>
            <select className="input" value={settings.groq_model} onChange={(e) => setSettings({ ...settings, groq_model: e.target.value })}>
              <option value="llama3-8b-8192">LLaMA 3 8B</option>
              <option value="llama3-70b-8192">LLaMA 3 70B</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">ChromaDB Path</label>
            <input className="input font-mono text-sm" value={settings.chroma_persist} onChange={(e) => setSettings({ ...settings, chroma_persist: e.target.value })} />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">Save Settings</button>
      </form>
    </div>
  )
}
