import { BsBoxArrowRight } from "react-icons/bs";

export default function LogoutButton() {
  const handleLogout = () => {
    // Disable Google auto-select and revoke the token
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-ghost">
      <BsBoxArrowRight />
      Logout
    </button>
  );
}
