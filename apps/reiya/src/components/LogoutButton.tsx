import { Button } from "@astryxdesign/core/Button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { useAppToast } from "./Toast";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useAppToast();

  const handleLogout = () => {
    setIsLoading(true);
    authClient
      .signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      })
      .catch(() => {
        toast("Failed to logout");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Button
      variant="ghost"
      label="Log out"
      onClick={() => {
        handleLogout();
      }}
      isDisabled={isLoading}
    >
      <LogOut />
      Logout
    </Button>
  );
}
