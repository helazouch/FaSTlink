import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedAdminRoute } from './auth/ProtectedAdminRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CommunitiesPage } from './pages/CommunitiesPage'
import { DashboardPage } from './pages/DashboardPage'
import { EntitiesPage } from './pages/EntitiesPage'
import { EventsPage } from './pages/EventsPage'
import { LoginPage } from './pages/LoginPage'
import { ModerationPage } from './pages/ModerationPage'
import { PublicationsPage } from './pages/PublicationsPage'
import { RequestsPage } from './pages/RequestsPage'
import { SettingsPage } from './pages/SettingsPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { UsersPage } from './pages/UsersPage'
import { useAuthStore } from './stores/authStore'
import { useUiStore } from './stores/uiStore'

export default function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="entities" element={<EntitiesPage />} />
          <Route path="publications" element={<PublicationsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="moderation" element={<ModerationPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
