import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { SocialLayout } from './components/templates/SocialLayout'
import { CommunitiesPage } from './pages/CommunitiesPage'
import { CommunityPage } from './pages/CommunityPage'
import { CommunityMessagingPage } from './pages/CommunityMessagingPage'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { RequestsPage } from './pages/RequestsPage'
import { SavedItemsPage } from './pages/SavedItemsPage'

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
          <Route path="requests" element={<RequestsPage />} />
          <Route path="saved" element={<SavedItemsPage />} />
          <Route path="messages" element={<CommunityMessagingPage />} />
          <Route path="messages/community/:communityId" element={<CommunityMessagingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
