// src/routes/_authenticated.tsx
import { LoginModal } from "@/components/auth/LoginModal";
import { Forbidden } from "@/components/routing/Forbidden";
import { useAuth } from "@/hooks/useAuth";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_reponly")({
  component: () => {
    return <Outlet />;
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
