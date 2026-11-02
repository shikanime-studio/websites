import {
  Avatar,
  Button,
  Dialog,
  DialogHeader,
  Layout,
  LayoutContent,
  LayoutFooter,
  SegmentedControl,
  SegmentedControlItem,
  Text,
} from "@astryxdesign/core";
import { useAtomValue } from "@effect/atom-react";
import { ClientOnly } from "@tanstack/react-router";
import { getOrElse } from "effect/reactivity/AsyncResult";
import { LogIn, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import {
  signInWithStudio,
  signOutOfStudio,
  studioInitials,
  studioSessionAtom,
} from "../lib/studio";

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
  const studioUser = getOrElse(useAtomValue(studioSessionAtom), () => null);

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
            <Text
              type="label"
              className="text-secondary border-border mb-3 border-b pb-2 uppercase opacity-70"
            >
              Appearance
            </Text>

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
            <Text
              type="label"
              className="text-secondary border-border mt-6 mb-3 border-b pb-2 uppercase opacity-70"
            >
              Studio account
            </Text>

            {studioUser
              ? (
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={studioInitials(studioUser)}
                      size="md"
                      src={studioUser.image ?? ""}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {studioUser.name}
                      </span>
                      <span className="text-secondary truncate text-xs opacity-80">
                        {studioUser.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    icon={<LogOut className="h-4 w-4" />}
                    label="Sign out"
                    onClick={() => {
                      void signOutOfStudio();
                    }}
                    size="sm"
                    variant="ghost"
                  />
                </div>
              )
              : (
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-medium">Not signed in</span>
                    <p className="text-secondary mt-0.5 text-xs opacity-80">
                      Sign in with your Shikanime Studio account. Fade never
                      uploads your photos.
                    </p>
                  </div>
                  <Button
                    icon={<LogIn className="h-4 w-4" />}
                    label="Sign in"
                    onClick={signInWithStudio}
                    size="sm"
                    variant="secondary"
                  />
                </div>
              )}
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
