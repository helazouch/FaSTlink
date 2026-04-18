export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return 'N/A'
  }

  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

export const compactNumber = (value: number): string => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
