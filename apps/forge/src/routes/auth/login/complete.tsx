import { previousPathnameAtom, userAtom, userRolesAtom } from "@/atoms/authSessionAtoms";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { reconnectWebSocket } from "@/lib/orpc";

function CompleteComponent() {
  const { user } = Route.useRouteContext();
  let previousPathname = useAtomValue(previousPathnameAtom);
  if (previousPathname === "/auth/login") {
    previousPathname = "/"
  }
  const setUser = useSetAtom(userAtom);
  const setRoles = useSetAtom(userRolesAtom);

  setUser(user);
  const convertedRoles = user!.roles.map((role) => role.name.toLowerCase())
  setRoles(convertedRoles)
  reconnectWebSocket();
  if (Route.useSearch().registered_now) {
    // TODO tutorial param for the home page?
  }
  return <Navigate to={previousPathname ?? "/"} replace={true} />;
};

export const Route = createFileRoute("/auth/login/complete")({
  component: CompleteComponent,
  validateSearch: <T extends { registered_now: boolean }>(search: T): T => search,
  beforeLoad: async ({ context: { user } }) => {
    if (!user) {
      throw redirect({ to: "/auth/login", replace: true });
    }
    return { user };
  },
});
