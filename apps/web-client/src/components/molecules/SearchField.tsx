import { Search } from 'lucide-react'
import { TextInput } from '../atoms/TextInput'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export const SearchField = ({ value, onChange, placeholder }: SearchFieldProps) => (
  <div className="relative w-full">
    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <TextInput
      aria-label={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="pl-9"
    />
  </div>
)
