export type BureauRole = 'SIMPLE_MEMBER' | 'BUREAU_MEMBER'
export type BureauEventStatus = 'draft' | 'published' | 'cancelled'
export type BureauPublicationStatus = 'draft' | 'published' | 'archived' | 'hidden'
export type BureauModerationStatus = 'pending' | 'approved' | 'rejected' | 'hidden'

export interface BureauMember {
  id: number
  name: string
  email: string
  role: BureauRole
  joinedAt: string
}

export interface BureauEvent {
  id: number
  title: string
  date: string
  status: BureauEventStatus
  participants: number
}

export interface BureauPublication {
  id: number
  title: string
  author: string
  status: BureauPublicationStatus
  comments: number
  reactions: number
}

export interface BureauModerationItem {
  id: number
  title: string
  source: 'publication' | 'comment' | 'message'
  reporter: string
  status: BureauModerationStatus
}

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()
const daysFromNow = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString()

export const createBureauSeed = (entityId: number | string | null, entityName = 'Selected entity') => {
  const numericId = Number(entityId ?? 1)
  const offset = Number.isFinite(numericId) ? numericId * 10 : 10

  return {
    entityName,
    members: [
      { id: offset + 1, name: 'Lina Haddad', email: 'lina.haddad@fastlink.test', role: 'BUREAU_MEMBER', joinedAt: daysAgo(120) },
      { id: offset + 2, name: 'Karim Saidi', email: 'karim.saidi@fastlink.test', role: 'SIMPLE_MEMBER', joinedAt: daysAgo(42) },
      { id: offset + 3, name: 'Meriem Ouali', email: 'meriem.ouali@fastlink.test', role: 'SIMPLE_MEMBER', joinedAt: daysAgo(18) },
    ] satisfies BureauMember[],
    events: [
      { id: offset + 11, title: `${entityName} onboarding`, date: daysFromNow(6), status: 'published', participants: 84 },
      { id: offset + 12, title: 'Project review session', date: daysFromNow(14), status: 'draft', participants: 31 },
      { id: offset + 13, title: 'Community meetup', date: daysFromNow(24), status: 'published', participants: 126 },
    ] satisfies BureauEvent[],
    publications: [
      { id: offset + 21, title: 'Weekly entity update', author: 'Lina Haddad', status: 'published', comments: 18, reactions: 92 },
      { id: offset + 22, title: 'Call for project leads', author: 'Karim Saidi', status: 'draft', comments: 4, reactions: 17 },
      { id: offset + 23, title: 'Retrospective summary', author: 'Meriem Ouali', status: 'archived', comments: 9, reactions: 45 },
    ] satisfies BureauPublication[],
    moderation: [
      { id: offset + 31, title: 'Flagged publication reply', source: 'comment', reporter: 'Nora B.', status: 'pending' },
      { id: offset + 32, title: 'Duplicate event announcement', source: 'publication', reporter: 'System', status: 'pending' },
      { id: offset + 33, title: 'Message needs review', source: 'message', reporter: 'Amine K.', status: 'pending' },
    ] satisfies BureauModerationItem[],
    trend: [
      { label: 'Members', value: 72 },
      { label: 'Events', value: 48 },
      { label: 'Posts', value: 86 },
      { label: 'Reports', value: 28 },
    ],
  }
}
