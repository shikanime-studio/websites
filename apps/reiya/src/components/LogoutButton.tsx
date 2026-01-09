import { useState } from "react";
import { BsBoxArrowRight } from "react-icons/bs";
import { authClient } from "../lib/auth-client";
import { AlertError } from "./AlertError";
import { Toast } from "./Toast";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError("Failed to logout");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          handleLogout();
        }}
        className="btn btn-ghost"
        disabled={isLoading}
      >
        <BsBoxArrowRight />
        Logout
      </button>
      {error && (
        <Toast
          duration={3000}
          onClose={() => {
            setError(null);
          }}
        >
          <AlertError
            onClose={() => {
              setError(null);
            }}
          >
            {error}
          </AlertError>
        </Toast>
      )}
    </>
  );
}
