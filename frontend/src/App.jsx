import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import { getMe } from '@/services/authService'

import LoginPage from '@/pages/auth/LoginPage'
import ChatPage from '@/pages/chat/ChatPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Layouts
import AdminLayout        from '@/components/layout/AdminLayout'
import InvestigatorLayout from '@/components/layout/InvestigatorLayout'
import AnalystLayout      from '@/components/layout/AnalystLayout'
import SupervisorLayout   from '@/components/layout/SupervisorLayout'

// Admin pages
import AdminDashboard  from '@/pages/admin/AdminDashboard'
import AdminUsers      from '@/pages/admin/AdminUsers'
import AdminRoles      from '@/pages/admin/AdminRoles'
import AdminDistricts  from '@/pages/admin/AdminDistricts'
import AdminStations   from '@/pages/admin/AdminStations'
import AdminCrimeTypes from '@/pages/admin/AdminCrimeTypes'
import AdminReports    from '@/pages/admin/AdminReports'

// Investigator pages
import InvestigatorDashboard    from '@/pages/investigator/InvestigatorDashboard'
import InvestigatorCases        from '@/pages/investigator/InvestigatorCases'
import InvestigatorFIR          from '@/pages/investigator/InvestigatorFIR'
import InvestigatorVictims      from '@/pages/investigator/InvestigatorVictims'
import InvestigatorSuspects     from '@/pages/investigator/InvestigatorSuspects'
import InvestigatorEvidence     from '@/pages/investigator/InvestigatorEvidence'
import InvestigatorAssistant    from '@/pages/investigator/InvestigatorAssistant'
import InvestigatorNetwork      from '@/pages/investigator/InvestigatorNetwork'
import InvestigatorTimeline     from '@/pages/investigator/InvestigatorTimeline'
import InvestigatorReports      from '@/pages/investigator/InvestigatorReports'
import InvestigatorSuspectProfile    from '@/pages/investigator/InvestigatorSuspectProfile'
import InvestigatorFinancialNetwork  from '@/pages/investigator/InvestigatorFinancialNetwork'

// Analyst pages
import AnalystDashboard    from '@/pages/analyst/AnalystDashboard'
import AnalystTrends       from '@/pages/analyst/AnalystTrends'
import AnalystHeatmaps     from '@/pages/analyst/AnalystHeatmaps'
import AnalystDistricts    from '@/pages/analyst/AnalystDistricts'
import AnalystForecasting  from '@/pages/analyst/AnalystForecasting'
import AnalystML           from '@/pages/analyst/AnalystML'
import AnalystNetwork      from '@/pages/analyst/AnalystNetwork'
import AnalystSociological from '@/pages/analyst/AnalystSociological'
import AnalystReports      from '@/pages/analyst/AnalystReports'

// Supervisor pages
import SupervisorDashboard  from '@/pages/supervisor/SupervisorDashboard'
import SupervisorState      from '@/pages/supervisor/SupervisorState'
import SupervisorHighRisk   from '@/pages/supervisor/SupervisorHighRisk'
import SupervisorOfficers   from '@/pages/supervisor/SupervisorOfficers'
import SupervisorResources  from '@/pages/supervisor/SupervisorResources'
import SupervisorInsights   from '@/pages/supervisor/SupervisorInsights'
import SupervisorReports    from '@/pages/supervisor/SupervisorReports'

function RoleRedirect() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  if (!user) return null  // wait for profile to load
  const role = user.role
  if (role === 'admin')        return <Navigate to="/admin/dashboard" replace />
  if (role === 'crime_analyst') return <Navigate to="/analyst/dashboard" replace />
  if (role === 'supervisor')   return <Navigate to="/supervisor/dashboard" replace />
  return <Navigate to="/investigator/dashboard" replace />
}

export default function App() {
  const { token, user, setUser, clearAuth } = useAuthStore()

  // On page refresh: token exists but user is null — re-fetch profile
  useEffect(() => {
    if (token && !user) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => clearAuth())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

        {/* Root redirect based on role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/users"       element={<AdminUsers />} />
            <Route path="/admin/roles"       element={<AdminRoles />} />
            <Route path="/admin/districts"   element={<AdminDistricts />} />
            <Route path="/admin/stations"    element={<AdminStations />} />
            <Route path="/admin/crime-types" element={<AdminCrimeTypes />} />
            <Route path="/admin/reports"     element={<AdminReports />} />
          </Route>
        </Route>

        {/* Investigator routes */}
        <Route element={<ProtectedRoute allowedRoles={['investigator']} />}>
          <Route element={<InvestigatorLayout />}>
            <Route path="/investigator/dashboard"         element={<InvestigatorDashboard />} />
            <Route path="/investigator/cases"             element={<InvestigatorCases />} />
            <Route path="/investigator/fir"               element={<InvestigatorFIR />} />
            <Route path="/investigator/victims"           element={<InvestigatorVictims />} />
            <Route path="/investigator/suspects"          element={<InvestigatorSuspects />} />
            <Route path="/investigator/evidence"          element={<InvestigatorEvidence />} />
            <Route path="/investigator/assistant"         element={<InvestigatorAssistant />} />
            <Route path="/investigator/network"           element={<InvestigatorNetwork />} />
            <Route path="/investigator/timeline"          element={<InvestigatorTimeline />} />
            <Route path="/investigator/reports"           element={<InvestigatorReports />} />
            <Route path="/investigator/suspect-profile"   element={<InvestigatorSuspectProfile />} />
            <Route path="/investigator/financial-network" element={<InvestigatorFinancialNetwork />} />
          </Route>
        </Route>

        {/* Analyst routes */}
        <Route element={<ProtectedRoute allowedRoles={['crime_analyst']} />}>
          <Route element={<AnalystLayout />}>
            <Route path="/analyst/dashboard"      element={<AnalystDashboard />} />
            <Route path="/analyst/trends"         element={<AnalystTrends />} />
            <Route path="/analyst/heatmaps"       element={<AnalystHeatmaps />} />
            <Route path="/analyst/districts"      element={<AnalystDistricts />} />
            <Route path="/analyst/forecasting"    element={<AnalystForecasting />} />
            <Route path="/analyst/ml"             element={<AnalystML />} />
            <Route path="/analyst/network"        element={<AnalystNetwork />} />
            <Route path="/analyst/sociological"   element={<AnalystSociological />} />
            <Route path="/analyst/reports"        element={<AnalystReports />} />
          </Route>
        </Route>

        {/* Supervisor routes */}
        <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
          <Route element={<SupervisorLayout />}>
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/state"     element={<SupervisorState />} />
            <Route path="/supervisor/high-risk" element={<SupervisorHighRisk />} />
            <Route path="/supervisor/officers"  element={<SupervisorOfficers />} />
            <Route path="/supervisor/resources" element={<SupervisorResources />} />
            <Route path="/supervisor/insights"  element={<SupervisorInsights />} />
            <Route path="/supervisor/reports"   element={<SupervisorReports />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="text-center">
              <p className="text-6xl mb-4">🚫</p>
              <p className="text-xl font-bold text-white mb-2">Access Denied</p>
              <p className="text-slate-400 text-sm mb-6">You don't have permission to view this page.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
