// src/routes/_authenticated.tsx
import { LoginModal } from "@/components/auth/LoginModal";
import { Forbidden } from "@/components/routing/Forbidden";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute({
  component: () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
      return <LoginModal />;
    }
    if (!user?.roles.find((role) => role.name === "Rep")) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});
