import React from 'react';

export interface Tab {
  label: string;
  href?: string;
  active?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

interface PageTabsProps {
  activeTab?: string;
  tabs?: Tab[];
}

export const PageTabs: React.FC<PageTabsProps> = ({ activeTab, tabs: customTabs }) => {
  const defaultTabs: Tab[] = [
    { label: 'Merchs', href: '/browse?type=merchs', active: activeTab === 'merchs' },
    { label: 'Events', href: '/browse?type=events', active: activeTab === 'events' },
    { label: 'Artists', href: '/browse?type=artists', active: activeTab === 'artists' },
    { label: 'Characters', href: '/browse?type=characters', active: activeTab === 'characters' },
  ];

  const displayTabs = customTabs || defaultTabs;

  return (
    <div className="flex gap-6 sm:gap-8 overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
      {displayTabs.map((tab) => {
        const Component = tab.href ? 'a' : 'button';
        return (
          <Component
            key={tab.label}
            href={tab.href}
            onClick={tab.onClick}
            className={`
              pb-3 text-lg sm:text-xl font-bold transition-colors relative whitespace-nowrap
              ${tab.active ? 'text-black' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            {tab.label}
            {tab.isNew && (
              <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full align-top">NEW</span>
            )}
            {tab.active && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-t-full" />
            )}
          </Component>
        );
      })}
    </div>
  );
};
