import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Svg>
  );
}

export function Check(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m4.5 12.5 5 5L20 6.5" />
    </Svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect height="16" rx="3" width="18" x="3" y="5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Svg>
  );
}

export function MapPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 10.5c0 5.2-8 11-8 11s-8-5.8-8-11a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10.5" r="2.6" />
    </Svg>
  );
}

export function Camera(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8.5h2.6L8 6h8l1.4 2.5H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.4" />
    </Svg>
  );
}

export function Bell(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5" />
      <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

export function Images(props: IconProps) {
  return (
    <Svg {...props}>
      <rect height="14" rx="2.5" width="16" x="5" y="6" />
      <circle cx="10" cy="11" r="1.4" />
      <path d="m7 17 4.2-4.4 3.1 3 2.1-2 3.6 3.4" />
      <path d="M8 3.5h8M3.5 9v5" />
    </Svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7Z" />
      <path d="M18.5 16.5c.2 1.6 1 2.4 2.5 2.6-1.5.2-2.3 1-2.5 2.6-.2-1.6-1-2.4-2.5-2.6 1.5-.2 2.3-1 2.5-2.6Z" />
    </Svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 7.4 7 9.3 4-1.9 7-4.9 7-9.3V5.8L12 3Z" />
      <path d="m9 11.8 2.2 2.2L15.4 10" />
    </Svg>
  );
}

export function Globe(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5Z" />
    </Svg>
  );
}

export function Users(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.8 20c0-3.4 2.8-5.6 6.2-5.6s6.2 2.2 6.2 5.6" />
      <path d="M16.4 5.4a3.4 3.4 0 0 1 0 6.5" />
      <path d="M18 14.8c2.1.6 3.4 2.3 3.4 4.6" />
    </Svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function Search(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Svg>
  );
}

export function Upload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </Svg>
  );
}

export function Clock(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  );
}

export function Alert(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v5" />
      <path d="M12 16.3h.01" />
    </Svg>
  );
}

export function Layers(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 8.5 4.6L12 12.2 3.5 7.6 12 3Z" />
      <path d="m3.5 12.4 8.5 4.6 8.5-4.6" />
      <path d="m3.5 16.8 8.5 4.6 8.5-4.6" />
    </Svg>
  );
}

export function Grid(props: IconProps) {
  return (
    <Svg {...props}>
      <rect height="7" rx="2" width="7" x="3.5" y="3.5" />
      <rect height="7" rx="2" width="7" x="13.5" y="3.5" />
      <rect height="7" rx="2" width="7" x="3.5" y="13.5" />
      <rect height="7" rx="2" width="7" x="13.5" y="13.5" />
    </Svg>
  );
}

export function Lock(props: IconProps) {
  return (
    <Svg {...props}>
      <rect height="10" rx="2.5" width="15" x="4.5" y="10.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Svg>
  );
}

export function LogOut(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4.5h4.5A1.5 1.5 0 0 1 20 6v12a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </Svg>
  );
}

export function Heart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.5 2.9C19.5 15.4 12 20 12 20Z" />
    </Svg>
  );
}

export function HikariMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 10,
        background: "#ff6433",
        color: "#241c18",
        fontFamily:
          '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif',
        fontSize: 15,
        fontWeight: 700,
        lineHeight: 1,
        flex: "none",
        transform: "rotate(-4deg)",
        boxShadow: "0 2px 0 rgba(36, 28, 24, 0.12)",
      }}
    >
      光
    </span>
  );
}
