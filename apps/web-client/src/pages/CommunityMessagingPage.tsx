import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CommunitySidebar } from '../components/organisms/CommunityMessaging/CommunitySidebar'
import { ConversationPanel } from '../components/organisms/CommunityMessaging/ConversationPanel'
import { useMyCommunities } from '../hooks/useSocial'
import type { MyCommunity } from '../types/social'

export const CommunityMessagingPage = () => {
  const params = useParams<{ communityId?: string }>()
  const navigate = useNavigate()
  const { data: communities = [], isLoading } = useMyCommunities()

  const [mobileView, setMobileView] = useState<'sidebar' | 'conversation'>('sidebar')

  const urlCommunityId = params.communityId ? Number(params.communityId) : null

  const resolveActiveCommunity = (): MyCommunity | null => {
    if (communities.length === 0) return null
    if (urlCommunityId) {
      const found = communities.find((c) => c.id === urlCommunityId)
      if (found) return found
      return null // Security: Return null if user has no membership/visibility
    }
    return communities[0] ?? null
  }

  const activeCommunity = resolveActiveCommunity()

  useEffect(() => {
    if (!isLoading) {
      if (urlCommunityId) {
        const hasAccess = communities.some((c) => c.id === urlCommunityId)
        if (!hasAccess) {
          // Access Denied: redirect to safe default path
          navigate('/messages', { replace: true })
        }
      } else if (communities.length > 0) {
        const first = communities[0]
        if (first) {
          navigate(`/messages/community/${first.id}`, { replace: true })
        }
      }
    }
  }, [isLoading, communities, urlCommunityId, navigate])

  const handleSelectCommunity = (communityId: number) => {
    navigate(`/messages/community/${communityId}`)
    setMobileView('conversation')
  }

  const handleBackToSidebar = () => {
    setMobileView('sidebar')
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* --- Left sidebar: community list --- */}
      <div
        className={`w-72 shrink-0 overflow-hidden border-r border-slate-200 ${
          mobileView === 'sidebar' ? 'flex' : 'hidden'
        } flex-col lg:flex`}
      >
        <CommunitySidebar
          communities={communities}
          isLoading={isLoading}
          activeCommunityId={activeCommunity?.id ?? null}
          onSelectCommunity={handleSelectCommunity}
        />
      </div>

      {/* --- Right: conversation area --- */}
      <div
        className={`flex min-w-0 flex-1 flex-col ${
          mobileView === 'conversation' ? 'flex' : 'hidden'
        } lg:flex`}
      >
        {activeCommunity ? (
          <>
            {/* Mobile back button */}
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 lg:hidden">
              <button
                type="button"
                onClick={handleBackToSidebar}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft size={14} />
                Communities
              </button>
            </div>
            <ConversationPanel community={activeCommunity} />
          </>
        ) : !isLoading ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <p className="text-3xl">💬</p>
              <p className="mt-3 text-base font-semibold text-slate-700">
                No communities found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Join a community to start messaging
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  )
}
