import { authClient } from "../lib/auth-client";
import { useState } from "react";

export function LinkAccountButton({
  providerId,
  label,
}: {
  providerId: string;
  label: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    setIsLoading(true);
    try {
      await authClient.linkSocial({
        provider: providerId as any,
        callbackURL: "/user",
      });
    } catch (error) {
      console.error("Failed to link account", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      className="btn btn-primary"
      onClick={handleLink}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <span>Link {label}</span>
      )}
    </button>
  );
}
