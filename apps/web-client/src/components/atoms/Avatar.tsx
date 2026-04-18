import { cn } from '../../lib/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase())
  return initials.join('') || 'FL'
}

export const Avatar = ({ name, size = 'md', className }: AvatarProps) => (
  <div
    className={cn(
      'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-700 font-bold text-white',
      sizeClasses[size],
      className,
    )}
  >
    {initialsFromName(name)}
  </div>
)
