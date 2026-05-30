import type {
  ChatMessage,
  CommunitySummary,
  EventItem,
  NotificationItem,
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
