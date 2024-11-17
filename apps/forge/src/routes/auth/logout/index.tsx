import { authEffectAtom } from "@/atoms/authSessionAtoms";
import Title from "@/components/title";
import { useLogout } from "@/hooks/useLogout.ts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useEffect } from "react";

const LogOutComponent = () => {
  const logout = useLogout();
  const navigate = useNavigate();
  const [, setAuthEffect] = useAtom(authEffectAtom);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        setAuthEffect(false);
        await navigate({ to: "/" });
      } catch (error) {
        console.error("Failed to logout:", error);
        setAuthEffect(false);
        await navigate({ to: "/" });
      }
    };

    performLogout();
  }, [logout, navigate, setAuthEffect]);

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
