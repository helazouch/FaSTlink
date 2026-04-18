import type {
  ChatMessage,
  CommunitySummary,
  EventItem,
  FeedPost,
  NotificationItem,
  ServiceRequest,
  UserProfile,
  UserSummary,
} from '../types/social'

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()

export const mockUsers: UserSummary[] = [
  {
    id: 1,
    fullName: 'Nora Ait Kaci',
    headline: 'Community Strategist at FaST Link',
    online: true,
  },
  {
    id: 2,
    fullName: 'Yanis Bensalem',
    headline: 'Platform Engineer · Identity Team',
    online: true,
  },
  {
    id: 3,
    fullName: 'Ines Harrat',
    headline: 'Events Program Lead',
    online: false,
  },
  {
    id: 4,
    fullName: 'Samy Aouchiche',
    headline: 'Community Moderator',
    online: true,
  },
]

export const mockCommunities: CommunitySummary[] = [
  {
    id: 1,
    name: 'Founders Hub',
    description: 'Product strategy, startup playbooks, and funding preparation.',
    members: 12_340,
  },
  {
    id: 2,
    name: 'Engineers Circle',
    description: 'Architecture reviews, backend patterns, and reliability practices.',
    members: 9_210,
  },
  {
    id: 3,
    name: 'Events Studio',
    description: 'Event templates, speaker coaching, and attendance growth loops.',
    members: 4_802,
  },
]

export const mockFeedPosts: FeedPost[] = [
  {
    id: 'post-1',
    author: mockUsers[0],
    entity: 'FaST Link Platform',
    communityId: 1,
    content:
      'We just completed the onboarding redesign rollout. Activation in the first 24 hours increased by 16.8%. The next sprint focuses on event reminders and profile completion nudges.',
    media: [],
    createdAt: minutesAgo(25),
    likeCount: 212,
    commentCount: 24,
    shareCount: 11,
    likedByMe: false,
    savedByMe: false,
    comments: [
      {
        id: 'comment-1',
        author: mockUsers[1],
        content: 'Excellent work. Let us align this with the request prioritization board.',
        createdAt: minutesAgo(18),
      },
    ],
  },
  {
    id: 'post-2',
    author: mockUsers[1],
    entity: 'Engineers Circle',
    communityId: 2,
    content:
      'Deployment note: token refresh is now non-blocking and safe for concurrent tab sessions. We also reduced re-auth prompts during peak usage windows.',
    media: [],
    createdAt: hoursAgo(2),
    likeCount: 178,
    commentCount: 17,
    shareCount: 7,
    likedByMe: true,
    savedByMe: true,
    comments: [],
  },
  {
    id: 'post-3',
    author: mockUsers[2],
    entity: 'Events Studio',
    communityId: 3,
    content:
      'Speaker lineup for the spring community summit is finalized. Please review the event agenda and mark your availability in the participation panel.',
    media: [],
    createdAt: hoursAgo(4),
    likeCount: 96,
    commentCount: 9,
    shareCount: 4,
    likedByMe: false,
    savedByMe: false,
    comments: [],
  },
  {
    id: 'post-4',
    author: mockUsers[3],
    entity: 'Moderation Team',
    communityId: 1,
    content:
      'New moderation policy shipped today. Escalation paths for abusive behavior now include real-time notifications to domain owners.',
    media: [],
    createdAt: hoursAgo(6),
    likeCount: 75,
    commentCount: 6,
    shareCount: 2,
    likedByMe: false,
    savedByMe: false,
    comments: [],
  },
  {
    id: 'post-5',
    author: mockUsers[1],
    entity: 'Gateway Team',
    communityId: 2,
    content:
      'Latency regression in auth validation is fixed. p95 returned to normal range after cache invalidation key tuning.',
    media: [],
    createdAt: hoursAgo(9),
    likeCount: 124,
    commentCount: 13,
    shareCount: 5,
    likedByMe: false,
    savedByMe: false,
    comments: [],
  },
  {
    id: 'post-6',
    author: mockUsers[0],
    entity: 'Founders Hub',
    communityId: 1,
    content:
      'Next week, we launch the mentor-request matching form directly in Requests. This should cut routing time for support and partnerships.',
    media: [],
    createdAt: hoursAgo(12),
    likeCount: 143,
    commentCount: 22,
    shareCount: 8,
    likedByMe: false,
    savedByMe: false,
    comments: [],
  },
]

export const mockEvents: EventItem[] = [
  {
    id: 101,
    title: 'Community Growth Systems',
    description: 'A tactical workshop on retention loops and creator pipelines.',
    location: 'Algiers Tech Forum',
    startsAt: daysFromNow(2),
    endsAt: daysFromNow(2),
    capacity: 220,
    attendees: 168,
    communityId: 1,
    communityName: 'Founders Hub',
    participation: 'interested',
  },
  {
    id: 102,
    title: 'Reliability Incident Simulation',
    description: 'Hands-on chaos drill with API gateway and service dependencies.',
    location: 'Remote · Live',
    startsAt: daysFromNow(4),
    endsAt: daysFromNow(4),
    capacity: 180,
    attendees: 119,
    communityId: 2,
    communityName: 'Engineers Circle',
    participation: 'going',
  },
  {
    id: 103,
    title: 'Speaker Coaching Clinic',
    description: 'Practical speaking frameworks for panelists and moderators.',
    location: 'Oran Co-Lab',
    startsAt: daysFromNow(6),
    endsAt: daysFromNow(6),
    capacity: 90,
    attendees: 63,
    communityId: 3,
    communityName: 'Events Studio',
    participation: 'not-going',
  },
]

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    kind: 'success',
    title: 'Event approved',
    message: 'Your participation request for Reliability Incident Simulation is confirmed.',
    createdAt: minutesAgo(15),
    read: false,
  },
  {
    id: 'n-2',
    kind: 'alert',
    title: 'Community moderation escalation',
    message: 'A flagged post requires review from senior moderators.',
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: 'n-3',
    kind: 'info',
    title: 'Weekly digest ready',
    message: 'Your cross-community performance digest is available.',
    createdAt: hoursAgo(5),
    read: true,
  },
]

export const mockRequests: ServiceRequest[] = [
  {
    id: 9001,
    title: 'Need sponsor for student hackathon',
    category: 'Partnership',
    description:
      'Requesting outreach support and sponsor introduction for regional chapter event.',
    priority: 'high',
    status: 'pending',
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(2),
    communityId: 1,
    communityName: 'Founders Hub',
  },
  {
    id: 9002,
    title: 'Need event moderator roster',
    category: 'Operations',
    description: 'Seeking two experienced moderators for hybrid event broadcast.',
    priority: 'medium',
    status: 'approved',
    createdAt: hoursAgo(30),
    updatedAt: hoursAgo(6),
    communityId: 3,
    communityName: 'Events Studio',
  },
]

export const mockProfile: UserProfile = {
  id: 1,
  fullName: 'Nora Ait Kaci',
  email: 'nora@fastlink.app',
  headline: 'Community Strategist at FaST Link',
  bio: 'Building growth systems that connect communities, events, and creators around measurable outcomes.',
  location: 'Algiers, Algeria',
  joinedAt: '2024-02-18T09:00:00.000Z',
  interests: ['Community Design', 'Creator Economy', 'Events Strategy', 'Product Analytics'],
  stats: {
    followers: 642,
    following: 189,
    posts: 128,
  },
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'chat-1',
    communityId: 1,
    sender: mockUsers[0],
    content: 'Team, we are finalizing event copy by end of day.',
    createdAt: minutesAgo(35),
    mine: false,
  },
  {
    id: 'chat-2',
    communityId: 1,
    sender: {
      id: 999,
      fullName: 'You',
      headline: 'Platform Member',
      online: true,
    },
    content: 'Perfect. I will submit the participation request in Requests and share the ticket ID.',
    createdAt: minutesAgo(31),
    mine: true,
  },
]
