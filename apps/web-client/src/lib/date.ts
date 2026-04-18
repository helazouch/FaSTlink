import { format, formatDistanceToNowStrict } from 'date-fns'

export const formatDateTime = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date'
  }

  return format(parsed, 'EEE, dd MMM yyyy · HH:mm')
}

export const formatRelativeTime = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'just now'
  }

  return `${formatDistanceToNowStrict(parsed)} ago`
}
