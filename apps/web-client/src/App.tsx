import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RoleAwareRoute } from './auth/RoleAwareRoute'
import { PermissionGuard } from './components/auth/PermissionGuard'
import { SocialLayout } from './components/templates/SocialLayout'
import { BureauDashboardPage } from './pages/BureauDashboardPage'
import { BureauToolPage } from './pages/BureauToolPage'
import { CommunitiesPage } from './pages/CommunitiesPage'
import { CommunityPage } from './pages/CommunityPage'
import {
  CoordinatorAlertsPage,
  CoordinatorAnalyticsPage,
  CoordinatorDashboardPage,
  CoordinatorRequestsPage,
  CoordinatorSupervisionPage,
} from './pages/CoordinatorDashboardPage'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MessagesPage } from './pages/MessagesPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { RequestsPage } from './pages/RequestsPage'
import { SavedItemsPage } from './pages/SavedItemsPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<SocialLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/:communityId" element={<CommunityPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:eventId" element={<EventsPage />} />
          <Route path="saved" element={<SavedItemsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          <Route element={<RoleAwareRoute currentEntityRole="BUREAU_MEMBER" />}>
            <Route path="bureau" element={<BureauDashboardPage />} />
            <Route
              path="bureau/publish"
              element={
                <PermissionGuard permission="PUBLICATION_CREATE" fallback={<Navigate to="/unauthorized" replace />}>
                  <BureauToolPage />
                </PermissionGuard>
              }
            />
            <Route
              path="bureau/community"
              element={
                <PermissionGuard permission="COMMUNITY_MANAGE" fallback={<Navigate to="/unauthorized" replace />}>
                  <BureauToolPage />
                </PermissionGuard>
              }
            />
            <Route
              path="bureau/members"
              element={
                <PermissionGuard permission="ENTITY_MEMBER_MANAGE" fallback={<Navigate to="/unauthorized" replace />}>
                  <BureauToolPage />
                </PermissionGuard>
              }
            />
            <Route
              path="bureau/events"
              element={
                <PermissionGuard permission="EVENT_CREATE" fallback={<Navigate to="/unauthorized" replace />}>
                  <BureauToolPage />
                </PermissionGuard>
              }
            />
            <Route
              path="bureau/statistics"
              element={
                <PermissionGuard permission="ANALYTICS_VIEW" fallback={<Navigate to="/unauthorized" replace />}>
                  <BureauToolPage />
                </PermissionGuard>
              }
            />
          </Route>

          <Route element={<RoleAwareRoute currentEntityRole="BUREAU_MEMBER" />}>
            <Route path="requests" element={<RequestsPage />} />
          </Route>
          <Route element={<RoleAwareRoute globalRole="COORDINATOR" />}>
            <Route path="coordinator" element={<CoordinatorDashboardPage />} />
            <Route
              path="coordinator/requests"
              element={
                <PermissionGuard anyEntityPermission="REQUEST_APPROVE" fallback={<Navigate to="/unauthorized" replace />}>
                  <CoordinatorRequestsPage />
                </PermissionGuard>
              }
            />
            <Route
              path="coordinator/analytics"
              element={
                <PermissionGuard anyEntityPermission="ANALYTICS_VIEW" fallback={<Navigate to="/unauthorized" replace />}>
                  <CoordinatorAnalyticsPage />
                </PermissionGuard>
              }
            />
            <Route
              path="coordinator/supervision"
              element={
                <PermissionGuard anyEntityPermission="PUBLICATION_MODERATE" fallback={<Navigate to="/unauthorized" replace />}>
                  <CoordinatorSupervisionPage />
                </PermissionGuard>
              }
            />
            <Route path="coordinator/community" element={<BureauToolPage />} />
            <Route path="coordinator/members" element={<BureauToolPage />} />
            <Route path="coordinator/events" element={<BureauToolPage />} />
            <Route path="coordinator/publish" element={<BureauToolPage />} />
            <Route path="coordinator/statistics" element={<BureauToolPage />} />
            <Route path="coordinator/alerts" element={<CoordinatorAlertsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
