import { Activity, createContext, useContext, useState } from "react";
import type { FC, InputHTMLAttributes, ReactNode } from "react";

interface TabContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

interface TabListProps {
  children: ReactNode;
  className?: string;
  defaultTab: string;
}

export const TabList: FC<TabListProps> = ({
  children,
  className = "",
  defaultTab,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        role="tablist"
        className={`tabs flex-wrap justify-start gap-x-6 gap-y-4 sm:gap-x-8 ${className}`}
      >
        {children}
      </div>
    </TabContext.Provider>
  );
};

interface TabProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  children?: ReactNode;
  className?: string;
  value: string;
}

export const Tab: FC<TabProps> = ({
  children,
  className = "",
  value,
  ...props
}) => {
  const context = useContext(TabContext);

  const handleChange = () => {
    context?.setActiveTab(value);
  };

  return (
    <input
      type="radio"
      name="tabs"
      role="tab"
      {...props}
      className={`tab checked:tab-active checked:border-primary checked:text-primary content-center rounded-none border-transparent text-lg font-bold whitespace-nowrap text-gray-400 transition-colors checked:!border-b-4 hover:border-gray-300 hover:text-gray-600 sm:text-xl ${className} `}
      aria-label={typeof children === "string" ? children : undefined}
      checked={context?.activeTab === value}
      onChange={handleChange}
    />
  );
};

interface TabContentProps {
  children: ReactNode;
  className?: string;
  value: string;
}

export const TabContent: FC<TabContentProps> = ({
  children,
  className = "",
  value,
}) => {
  const context = useContext(TabContext);
  return (
    <div role="tabpanel" className={`tab-content ${className}`}>
      <Activity mode={context?.activeTab === value ? "visible" : "hidden"}>
        {children}
      </Activity>
    </div>
  );
};
