import type { InputHTMLAttributes, ReactNode } from "react";
import { Activity, useState } from "react";

interface TabListProps {
  children: (tab: { value: string; select: (value: string) => void }) => ReactNode;
  className?: string;
  defaultTab: string;
}

export function TabList({
  children,
  className = "",
  defaultTab,
}: TabListProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div
      role="tablist"
      className={`flex flex-wrap justify-start gap-x-6 gap-y-4 sm:gap-x-8 ${className}`}
    >
      {children({ value: activeTab, select: setActiveTab })}
    </div>
  );
}

interface TabProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "onSelect"
> {
  active: boolean;
  children?: ReactNode;
  className?: string;
  onSelect: (value: string) => void;
  value: string;
}

export function Tab({
  active,
  children,
  className = "",
  onSelect,
  value,
  ...props
}: TabProps) {
  return (
    <input
      type="radio"
      name="tabs"
      role="tab"
      {...props}
      className={`border-border checked:border-accent checked:text-secondary content-center rounded-none border-transparent text-lg font-bold whitespace-nowrap text-secondary/50 transition-colors checked:border-b-4! hover:border-border hover:text-secondary/80 sm:text-xl ${className} `}
      aria-label={typeof children === "string" ? children : undefined}
      checked={active}
      onChange={() => {
        onSelect(value);
      }}
    />
  );
}

interface TabContentProps {
  active: boolean;
  children: ReactNode;
  className?: string;
}

export function TabContent({
  active,
  children,
  className = "",
}: TabContentProps) {
  return (
    <div role="tabpanel" className={className}>
      <Activity mode={active ? "visible" : "hidden"}>
        {children}
      </Activity>
    </div>
  );
}
