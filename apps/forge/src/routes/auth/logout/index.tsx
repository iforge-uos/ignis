import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Title from "@/components/title";
import { useLogout } from "@/hooks/useLogout.ts";

const LogOutComponent = () => {
  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        // handle errors if any
        console.error("Failed to logout:", error);
        navigate({ to: "/" });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <>
      <Title prompt="Logout" />
      <div className="p-2">
        <h3>Logging out...</h3>
      </div>
    </>
  );
};

export default LogOutComponent;

export const Route = createFileRoute("/auth/logout/")({
  component: LogOutComponent,
});
