import React from 'react';

interface FilterButtonProps {
  label: string;
  active?: boolean;
  hasDropdown?: boolean;
  onClick?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, active, hasDropdown, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
      ${active
        ? 'bg-black text-white hover:bg-gray-800'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
    `}
  >
    {label}
    {hasDropdown && (
      <svg className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )}
  </button>
);

interface FilterBarProps {
  categories?: string[];
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ categories = [], className = "" }) => {
  return (
    <div className={`flex gap-3 overflow-x-auto pb-4 scrollbar-hide ${className}`}>
      <FilterButton label="Category" hasDropdown />
      <FilterButton label="Licenses" hasDropdown />
      <FilterButton label="Service options" hasDropdown />
      <FilterButton label="Price" hasDropdown />
      <FilterButton label="On sale" />
      {categories.map((cat) => (
        <FilterButton key={cat} label={cat} />
      ))}
    </div>
  );
};
