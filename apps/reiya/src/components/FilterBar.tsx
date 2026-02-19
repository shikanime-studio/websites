import type { FC, ReactNode } from 'react'

export interface FilterButtonProps {
  label: string
  active?: boolean
  hasDropdown?: boolean
  onClick?: () => void
}

export const FilterButton: FC<FilterButtonProps> = ({
  label,
  active,
  hasDropdown,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn btn-neutral flex items-center gap-2 rounded-full border-none px-4 py-2 text-sm font-medium transition-all ${
      active
        ? 'text-primary bg-gray-200 font-bold hover:bg-gray-300'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    } `}
  >
    {label}
    {hasDropdown && (
      <svg
        aria-hidden="true"
        className={`h-4 w-4 ${active ? 'text-primary' : 'text-gray-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )}
  </button>
)

interface FilterBarProps {
  children?: ReactNode
}

export const FilterBar: FC<FilterBarProps> = ({ children }) => {
  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
      {children}
    </div>
  )
}
