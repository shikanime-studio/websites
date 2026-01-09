import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../hooks/useTheme";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Ensure we mount only when document is available (client-side)
  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      onCancel={onClose}
    >
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </form>

        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
          <span>Settings</span>
        </h3>

        <div className="py-2">
          <h4 className="border-base-200 mb-3 border-b pb-2 text-xs font-bold tracking-wider uppercase opacity-50">
            Appearance
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Theme</span>
              <p className="mt-0.5 text-xs opacity-70">
                Switch between light, dark, or system mode
              </p>
            </div>

            <div className="join">
              <button
                className={`join-item btn btn-sm ${theme === "light" ? "btn-active btn-neutral" : ""}`}
                onClick={() => { setTheme("light"); }}
                aria-pressed={theme === "light"}
                aria-label="Light Mode"
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
              <button
                className={`join-item btn btn-sm ${theme === "dark" ? "btn-active btn-neutral" : ""}`}
                onClick={() => { setTheme("dark"); }}
                aria-pressed={theme === "dark"}
                aria-label="Dark Mode"
              >
                <Moon className="h-4 w-4" />
                Dark
              </button>
              <button
                className={`join-item btn btn-sm ${theme === "system" ? "btn-active btn-neutral" : ""}`}
                onClick={() => { setTheme("system"); }}
                aria-pressed={theme === "system"}
                aria-label="System Mode"
              >
                <Monitor className="h-4 w-4" />
                System
              </button>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} type="button">
          close
        </button>
      </form>
    </dialog>,
    document.body,
  );
}
