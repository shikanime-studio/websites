import type { FC } from 'react'

export const SkeletonCard: FC = () => {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="skeleton aspect-4/3 w-full rounded-2xl"></div>

      <div className="flex flex-col gap-2">
        <div className="skeleton h-5 w-3/4"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="skeleton h-5 w-5 rounded-full"></div>
            <div className="skeleton h-4 w-24"></div>
          </div>
          <div className="skeleton h-4 w-16"></div>
        </div>
      </div>
    </div>
  )
}
