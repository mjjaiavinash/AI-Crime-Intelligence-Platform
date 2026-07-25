import { useState } from 'react'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import TrendLineChart from '@/components/charts/TrendLineChart'
import CrimeBarChart from '@/components/charts/CrimeBarChart'
import { formatDate } from '@/utils/helpers'

// ── Mock data (replace with API calls) ───────────────────────────────────────
const MOCK_CRIMES = [
  { id: 1, title: 'Armed Robbery — 5th Ave',    crime_type: 'robbery',  status: 'open',                location_name: 'Downtown',  occurred_at: '2024-06-01T22:30:00Z' },
  { id: 2, title: 'Vehicle Theft — Parking Lot', crime_type: 'theft',    status: 'under_investigation', location_name: 'Midtown',   occurred_at: '2024-06-02T03:00:00Z' },
  { id: 3, title: 'Assault — Central Park',      crime_type: 'assault',  status: 'closed',              location_name: 'Uptown',    occurred_at: '2024-06-03T18:15:00Z' },
  { id: 4, title: 'Wire Fraud — Finance Dist.',  crime_type: 'fraud',    status: 'open',                location_name: 'Wall St',   occurred_at: '2024-06-04T09:00:00Z' },
  { id: 5, title: 'Burglary — Warehouse',        crime_type: 'theft',    status: 'open',                location_name: 'East Side', occurred_at: '2024-06-05T01:45:00Z' },
]

const MOCK_TRENDS = [
  { month: 'Jan', total: 42 }, { month: 'Feb', total: 38 }, { month: 'Mar', total: 55 },
  { month: 'Apr', total: 47 }, { month: 'May', total: 61 }, { month: 'Jun', total: 53 },
]

const MOCK_BY_TYPE = [
  { crime_type: 'theft',   total: 34 }, { crime_type: 'robbery', total: 21 },
  { crime_type: 'assault', total: 18 }, { crime_type: 'fraud',   total: 14 },
  { crime_type: 'other',   total: 9  },
]

const COLUMNS = [
  { key: 'id',            label: '#',        render: (r) => <span className="font-mono text-slate-500">#{r.id}</span> },
  { key: 'title',         label: 'Incident', render: (r) => <span className="font-medium text-white">{r.title}</span> },
  { key: 'crime_type',    label: 'Type',     render: (r) => <span className="capitalize text-slate-300">{r.crime_type}</span> },
  { key: 'location_name', label: 'Location' },
  { key: 'occurred_at',   label: 'Date',     render: (r) => formatDate(r.occurred_at) },
  { key: 'status',        label: 'Status',   render: (r) => <Badge label={r.status.replace('_', ' ')} variant={r.status} /> },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Intelligence Dashboard"
        subtitle={`Operational overview — ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`}
        action={
          <div className="flex items-center gap-2 text-xs font-mono text-success
                          bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
            LIVE
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Crimes"    value="296"  trend={12}  icon={<IconShield />} accent />
        <StatCard title="Open Cases"      value="84"   trend={5}   icon={<IconAlert />} />
        <StatCard title="Closed Cases"    value="178"  trend={-8}  icon={<IconCheck />} />
        <StatCard title="Under Review"    value="34"   trend={3}   icon={<IconClock />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Monthly Crime Trend</p>
          <p className="text-xs text-slate-500 mb-4">Incidents reported per month</p>
          <TrendLineChart data={MOCK_TRENDS} />
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-1">Crime by Type</p>
          <p className="text-xs text-slate-500 mb-4">Distribution across categories</p>
          <CrimeBarChart data={MOCK_BY_TYPE} />
        </div>
      </div>

      {/* Recent crimes table */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div>
            <p className="text-sm font-semibold text-white">Recent Incidents</p>
            <p className="text-xs text-slate-500 mt-0.5">Latest filed crime records</p>
          </div>
          <span className="badge bg-primary-500/15 text-primary-300 border border-primary-500/30">
            {MOCK_CRIMES.length} records
          </span>
        </div>
        <Table columns={COLUMNS} data={MOCK_CRIMES} loading={false} />
      </div>
    </div>
  )
}

function IconShield() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
}
function IconAlert() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
}
function IconCheck() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}
function IconClock() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}
