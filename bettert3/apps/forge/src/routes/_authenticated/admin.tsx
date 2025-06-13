import { Forbidden } from "@/components/routing/Forbidden";
import { Outlet } from "@tanstack/react-router";
import {useAuth} from "@/hooks/useAuth";
import {LoginModal} from "@/components/auth/LoginModal";

export const Route = createFileRoute({
  component: () => {
    const { isAuthenticated, user } = useAuth();
    console.log(user);

    if (!isAuthenticated) {
      return <LoginModal />;
    }
    if (!user?.roles.find((role) => role.name === "Admin")) {
      return <Forbidden />;
    }
    return <Outlet />;
  },
});
