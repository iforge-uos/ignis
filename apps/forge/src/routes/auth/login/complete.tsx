import { originalUserRolesAtom, previousPathnameAtom, userAtom } from "@/atoms/authSessionAtoms";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { reconnectWebSocket } from "@/lib/orpc";

export const CompleteComponent = () => {
  const {user} = Route.useRouteContext();
  const previousPathname = useAtomValue(previousPathnameAtom);
  const setUser = useSetAtom(userAtom);
  const setOriginalRoles = useSetAtom(originalUserRolesAtom);
  setUser(user);
  setOriginalRoles(user!.roles.map((role) => role.name.toLowerCase()));
  reconnectWebSocket();
  if (Route.useSearch().registered_now) {
    // TODO tutorial param for the home page?
  }
  return <Navigate to={previousPathname ?? "/"} replace={true} />;
};

export const Route = createFileRoute("/auth/login/complete")({
  component: CompleteComponent,
  validateSearch: <T extends {registered_now: boolean}>(search: T): T => search,
  beforeLoad: async ({context: {user}}) => {
    if (!user) {
     throw redirect({ to: "/auth/login", replace: true });
    }
    return { user };
  },
});
