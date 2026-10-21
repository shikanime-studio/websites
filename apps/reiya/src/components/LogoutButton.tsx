import { Button } from "@astryxdesign/core/Button";
import { useToast } from "@astryxdesign/core/Toast";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { showToast } from "./Toast";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const toast = showToast(useToast());

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
