import type { ReactNode } from "react";

/**
 * The page column: one max width, one gutter, one vertical rhythm — the same
 * box the header sits in, so text lines up with the brand mark on every app.
 */
export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`studio-page ${className}`.trim()}>
      <div className="studio-shell">{children}</div>
    </div>
  );
}
