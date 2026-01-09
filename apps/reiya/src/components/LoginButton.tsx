import { useState } from "react";
import { BsGoogle } from "react-icons/bs";
import { authClient } from "../lib/auth-client";
import { AlertError } from "./AlertError";
import { Toast } from "./Toast";

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = () => {
    setIsLoading(true);
    authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/",
      })
      .catch(() => {
        setError("An error occurred during sign in");
        setIsLoading(false);
      }).finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <button
        type="button"
        className="btn rounded-full px-4 font-bold"
        onClick={() => {
          handleSignIn();
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            SIGNING IN
          </>
        ) : (
          <>
            <BsGoogle />
            SIGN IN
          </>
        )}
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
