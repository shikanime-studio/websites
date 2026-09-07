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
      className={`inline-flex items-center font-medium bg-inverted text-on-dark flex items-center gap-2 rounded-full border-none px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "text-accent bg-surface font-bold hover:bg-border"
          : "bg-surface text-secondary hover:bg-surface"
      } `}
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
