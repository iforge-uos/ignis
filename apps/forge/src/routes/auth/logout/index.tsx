import Title from "@/components/title";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { userAtom, userRolesAtom } from "@/atoms/authSessionAtoms";
import { useLogout } from "@/hooks/useLogout";
import { Hammer } from "/src/components/loading";

const LogOutComponent = () => {
  const logout = useLogout();
  const set = useSetAtom(userAtom);
  const setRoles = useSetAtom(userRolesAtom);

  set(null);
  setRoles([]);

  useEffect(() => {
    (async () => {
      await logout();
    })();
  });

  return (
    <>
      <Title prompt="Logout" />
      <Hammer />
    </>
  );
};

export const Route = createFileRoute("/auth/logout/")({
  component: LogOutComponent,
});
