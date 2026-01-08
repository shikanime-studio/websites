import { authClient } from "../lib/auth-client";
import { BsBoxArrowRight } from "react-icons/bs";

export default function LogoutButton() {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <button type="button" onClick={handleLogout} className="btn btn-ghost">
      <BsBoxArrowRight />
      Logout
    </button>
  );
}
