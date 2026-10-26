import type { ReactNode } from "react";

export interface FilterButtonProps {
  label: string;
  active?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
}

export function FilterButton({
  label,
  active,
  hasDropdown,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-accent bg-accent-muted text-text-accent font-semibold"
          : "border-border bg-body text-secondary hover:bg-surface font-medium"
      }`}
    >
      {label}
      {hasDropdown && (
        <svg
          aria-hidden="true"
          className={`h-4 w-4 ${active ? "text-accent" : "text-secondary/70"}`}
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
  );
}

interface FilterBarProps {
  children?: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
      {children}
    </div>
  );
}
