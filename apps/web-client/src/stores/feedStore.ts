import { create } from 'zustand'

interface FeedStoreState {
  searchQuery: string
  activeCommunityId: number | null
  expandedCommentsByPostId: Record<string, boolean>
  setSearchQuery: (value: string) => void
  setActiveCommunityId: (communityId: number | null) => void
  toggleComments: (postId: string) => void
}

export const useFeedStore = create<FeedStoreState>((set) => ({
  searchQuery: '',
  activeCommunityId: null,
  expandedCommentsByPostId: {},
  setSearchQuery: (value) => set({ searchQuery: value }),
  setActiveCommunityId: (communityId) => set({ activeCommunityId: communityId }),
  toggleComments: (postId) =>
    set((state) => ({
      expandedCommentsByPostId: {
        ...state.expandedCommentsByPostId,
        [postId]: !state.expandedCommentsByPostId[postId],
      },
    })),
}))
