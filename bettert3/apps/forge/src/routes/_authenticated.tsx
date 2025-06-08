// src/routes/_authenticated.tsx
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <LoginModal />;
    }

    return <Outlet />;
  },
});
