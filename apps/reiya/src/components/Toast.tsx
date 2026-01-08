import { useState } from "react";
import { createPortal } from "react-dom";
import { useTimeout } from "usehooks-ts";
import type { FC, ReactNode } from "react";

export interface ToastProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast: FC<ToastProps> = ({
  children,
  className = "",
  duration,
  onClose,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useTimeout(
    () => {
      onClose?.();
    },
    duration && !isHovered ? duration : null,
  );

  return createPortal(
    <div
      className={`toast toast-end toast-bottom z-50 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>,
    document.body,
  );
};
