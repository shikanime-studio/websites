import { BsGoogle } from "react-icons/bs";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <button
      className="btn btn-outline rounded-full font-bold px-4"
      onClick={handleSignIn}
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
  );
}
