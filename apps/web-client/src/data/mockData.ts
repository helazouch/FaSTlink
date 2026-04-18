import type {
  ChatMessage,
  DashboardSummary,
  EventItem,
  NotificationItem,
  Publication,
} from '../types/domain'

const minutesAgo = (value: number): string => new Date(Date.now() - value * 60_000).toISOString()
const hoursAgo = (value: number): string => new Date(Date.now() - value * 3_600_000).toISOString()
const daysFromNow = (value: number): string => new Date(Date.now() + value * 86_400_000).toISOString()

export const mockDashboardSummary: DashboardSummary = {
  totalMembers: 24_380,
  activeCommunities: 148,
  weeklyEvents: 27,
  publicationsToday: 63,
  growthRate: 12.4,
  engagementRate: 68.3,
  activeNow: 1_943,
  activityTimeline: [22, 36, 31, 47, 58, 53, 66, 44],
}

export const mockPublications: Publication[] = [
  {
    id: 'pub-1',
    author: 'Sarah M.',
    community: 'Design Lab',
    title: 'A refreshed onboarding flow is live for beta users',
    excerpt:
      'The new progressive onboarding reduces drop-off after account creation and introduces contextual hints in the first 2 minutes.',
    createdAt: minutesAgo(22),
    reactions: 186,
    comments: 42,
    tags: ['UX', 'Launch'],
    isPinned: true,
  },
  {
    id: 'pub-2',
    author: 'Ilyes R.',
    community: 'Engineering Core',
    title: 'Gateway observability metrics dashboard published',
    excerpt:
      'We exposed route latency percentiles and correlation identifiers. This helps us identify throttling bottlenecks under heavy traffic.',
    createdAt: hoursAgo(2),
    reactions: 121,
    comments: 16,
    tags: ['Backend', 'Observability'],
  },
  {
    id: 'pub-3',
    author: 'Lina T.',
    community: 'Community Ops',
    title: 'Mentor matching week starts this Friday',
    excerpt:
      'Each newcomer gets matched with a mentor based on learning goals, time zone overlap, and preferred communication style.',
    createdAt: hoursAgo(5),
    reactions: 214,
    comments: 58,
    tags: ['People', 'Program'],
  },
  {
    id: 'pub-4',
    author: 'Amine B.',
    community: 'Events Crew',
    title: 'Hybrid event kit now available to chapter leads',
    excerpt:
      'Toolkit includes venue setup checklist, streaming presets, moderation scripts, and post-event feedback templates.',
    createdAt: hoursAgo(10),
    reactions: 95,
    comments: 11,
    tags: ['Events', 'Operations'],
  },
]

export const mockEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Creator Growth Workshop',
    community: 'Creator Hub',
    startsAt: daysFromNow(1),
    location: 'Algiers Innovation Campus',
    attendees: 84,
    capacity: 120,
    status: 'open',
    description: 'Hands-on growth loops for content creators and community managers.',
  },
  {
    id: 'evt-2',
    title: 'Microservices Reliability Clinic',
    community: 'Engineering Core',
    startsAt: daysFromNow(2),
    location: 'Live Stream',
    attendees: 201,
    capacity: 220,
    status: 'open',
    description: 'Incident response drills and practical resilience patterns for distributed systems.',
  },
  {
    id: 'evt-3',
    title: 'Community Leaders Roundtable',
    community: 'Community Ops',
    startsAt: daysFromNow(4),
    location: 'Oran Co-Lab',
    attendees: 54,
    capacity: 60,
    status: 'closed',
    description: 'Regional chapter leadership playbooks and funding alignment updates.',
  },
  {
    id: 'evt-4',
    title: 'Night of Product Demos',
    community: 'Design Lab',
    startsAt: daysFromNow(7),
    location: 'FastLink Arena',
    attendees: 0,
    capacity: 180,
    status: 'draft',
    description: 'Open floor to preview upcoming initiatives and collect rapid user feedback.',
  },
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'Nora',
    content: 'Morning team. We are tracking a great spike on event registrations.',
    sentAt: minutesAgo(30),
    channel: 'general',
    mine: false,
  },
  {
    id: 'msg-2',
    sender: 'You',
    content: 'Awesome. I will prepare the dashboard highlights before stand-up.',
    sentAt: minutesAgo(25),
    channel: 'general',
    mine: true,
  },
  {
    id: 'msg-3',
    sender: 'Nora',
    content: 'Perfect. Please also share the top communities by engagement.',
    sentAt: minutesAgo(23),
    channel: 'general',
    mine: false,
  },
]

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Queue pressure detected',
    message: 'Message delivery retries crossed the warning threshold for the feed worker.',
    createdAt: minutesAgo(18),
    read: false,
    actionLabel: 'Inspect queue',
  },
  {
    id: 'notif-2',
    type: 'success',
    title: 'Event published',
    message: 'The "Microservices Reliability Clinic" event is now visible to all members.',
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'New moderation policy',
    message: 'Content safety rules were updated for community channels.',
    createdAt: hoursAgo(4),
    read: true,
    actionLabel: 'Read policy',
  },
  {
    id: 'notif-4',
    type: 'warning',
    title: 'Storage nearing limit',
    message: 'Media bucket usage reached 82% of the allocated quota.',
    createdAt: hoursAgo(9),
    read: true,
    actionLabel: 'Manage files',
  },
]
