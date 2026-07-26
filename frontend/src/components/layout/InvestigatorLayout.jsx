import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import InvestigatorSidebar from '@/components/layout/sidebars/InvestigatorSidebar'
import Navbar from '@/components/layout/Navbar'

export default function InvestigatorLayout() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {open && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <InvestigatorSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onClose={() => setOpen(false)} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in"><Outlet /></main>
      </div>
    </div>
  )
}
