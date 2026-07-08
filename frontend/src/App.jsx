import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage     from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import ReportsPage   from '@/pages/reports/ReportsPage'
import AdminPage     from '@/pages/admin/AdminPage'
import Layout        from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a2235', color: '#e2e8f0', border: '1px solid #334155', fontSize: 13 },
          success: { iconTheme: { primary: '#10b981', secondary: '#0a0f1e' } },
          error:   { iconTheme: { primary: '#e63946', secondary: '#0a0f1e' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/"          element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports"   element={<ReportsPage />} />
            <Route path="/admin"     element={<AdminPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
