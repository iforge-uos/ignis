import { Forbidden } from "@/components/routing/Forbidden";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import {useAuth} from "@/hooks/useAuth";
import {LoginModal} from "@/components/auth/LoginModal";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => {
    return <Outlet/>
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
