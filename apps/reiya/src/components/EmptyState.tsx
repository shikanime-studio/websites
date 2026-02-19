import type { ReactNode } from 'react'
import { Box } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({
  title = 'No items found',
  description = 'We couldn\'t find anything matching your criteria.',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-base-200 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
        {icon ?? <Box className="text-base-content/30 h-10 w-10" />}
      </div>
      <h3 className="text-base-content text-lg font-bold">{title}</h3>
      <p className="text-base-content/70 mt-1 max-w-sm text-sm">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
