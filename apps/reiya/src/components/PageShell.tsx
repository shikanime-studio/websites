import type { ReactNode } from "react";

/** Every page sits in the same column: one max width, one gutter, one rhythm. */
export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 ${className}`}
    >
      {children}
    </div>
  );
}
