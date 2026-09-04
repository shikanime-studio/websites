import {
  Button,
  Dialog,
  DialogHeader,
  Layout,
  LayoutContent,
  LayoutFooter,
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core";
import { ClientOnly } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal(props: SettingsModalProps) {
  return (
    <ClientOnly fallback={null}>
      <SettingsModalContent {...props} />
    </ClientOnly>
  );
}

function SettingsModalContent({ open: isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
      <Layout
        header={
          <DialogHeader
            title="Settings"
            onOpenChange={(open) => (open ? null : onClose())}
          />
        }
        content={
          <LayoutContent>
            <h4 className="text-secondary border-border mb-3 border-b pb-2 text-xs font-bold tracking-wider uppercase opacity-70">
              Appearance
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Theme</span>
                <p className="text-secondary mt-0.5 text-xs opacity-80">
                  Switch between light and dark mode
                </p>
              </div>

              <div className="flex items-center gap-2">
                <SegmentedControl
                  label="Theme"
                  value={theme ?? ""}
                  onChange={(value) => {
                    if (value === "light" || value === "dark") {
                      setTheme(value);
                    } else {
                      setTheme(undefined);
                    }
                  }}
                >
                  <SegmentedControlItem
                    value="light"
                    label="Light"
                    icon={<Sun className="h-4 w-4" />}
                  />
                  <SegmentedControlItem
                    value="dark"
                    label="Dark"
                    icon={<Moon className="h-4 w-4" />}
                  />
                </SegmentedControl>

                {theme && (
                  <Button
                    variant="ghost"
                    size="sm"
                    label="Reset to system default"
                    icon={<Monitor className="h-4 w-4" />}
                    onClick={() => {
                      setTheme(undefined);
                    }}
                  />
                )}
              </div>
            </div>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <Button variant="primary" label="Done" onClick={onClose} />
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
