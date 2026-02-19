import type { ReactNode } from 'react'

export interface AlertErrorProps {
  title?: string
  children: ReactNode
  onClose?: () => void
}

export function AlertError({
  title,
  children,
  onClose,
}: AlertErrorProps) {
  return (
    <div className="alert alert-error cursor-pointer shadow-lg">
      <div className="flex w-full flex-col gap-2">
        {title && <h3 className="text-lg font-bold">{title}</h3>}
        <div className="text-sm">{children}</div>
        {onClose && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
