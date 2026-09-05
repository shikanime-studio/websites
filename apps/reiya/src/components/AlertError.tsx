import type { ReactNode } from "react";

export interface AlertErrorProps {
  title?: string;
  children: ReactNode;
  onClose?: () => void;
}

export function AlertError({ title, children, onClose }: AlertErrorProps) {
  return (
    <div
      role="alert"
      className="cursor-pointer rounded-md border border-[var(--color-error)] bg-[var(--color-error-muted)] px-4 py-3 text-[var(--color-on-error)] shadow-lg"
    >
      <div className="flex w-full flex-col gap-2">
        {title && <h3 className="text-lg font-bold">{title}</h3>}
        <div className="text-sm">{children}</div>
        {onClose && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="inline-flex items-center font-medium h-8 px-3 text-sm hover:bg-surface transition-colors"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
