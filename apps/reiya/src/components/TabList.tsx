import type { InputHTMLAttributes, ReactNode } from 'react'
import { Activity, createContext, use, useState } from 'react'

interface TabContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

interface TabListProps {
  children: ReactNode
  className?: string
  defaultTab: string
}

export function TabList({
  children,
  className = '',
  defaultTab,
}: TabListProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabContext value={{ activeTab, setActiveTab }}>
      <div
        role="tablist"
        className={`tabs flex-wrap justify-start gap-x-6 gap-y-4 sm:gap-x-8 ${className}`}
      >
        {children}
      </div>
    </TabContext>
  )
}

interface TabProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  children?: ReactNode
  className?: string
  value: string
}

export function Tab({
  children,
  className = '',
  value,
  ...props
}: TabProps) {
  const context = use(TabContext)

  const handleChange = () => {
    context?.setActiveTab(value)
  }

  return (
    <input
      type="radio"
      name="tabs"
      role="tab"
      {...props}
      className={`tab checked:tab-active checked:border-primary checked:text-primary content-center rounded-none border-transparent text-lg font-bold whitespace-nowrap text-gray-400 transition-colors checked:border-b-4! hover:border-gray-300 hover:text-gray-600 sm:text-xl ${className} `}
      aria-label={typeof children === 'string' ? children : undefined}
      checked={context?.activeTab === value}
      onChange={handleChange}
    />
  )
}

interface TabContentProps {
  children: ReactNode
  className?: string
  value: string
}

export function TabContent({
  children,
  className = '',
  value,
}: TabContentProps) {
  const context = use(TabContext)
  return (
    <div role="tabpanel" className={`tab-content ${className}`}>
      <Activity mode={context?.activeTab === value ? 'visible' : 'hidden'}>
        {children}
      </Activity>
    </div>
  )
}
