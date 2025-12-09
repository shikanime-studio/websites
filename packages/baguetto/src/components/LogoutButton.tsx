import { BsBoxArrowRight } from "react-icons/bs";
import { authClient } from "../lib/auth-client";

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
    <button onClick={handleLogout} className="btn btn-ghost">
      <BsBoxArrowRight />
      Logout
    </button>
  );
}
