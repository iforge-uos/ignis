// src/hooks/useAuth.ts
import { useAtom } from "jotai";
import { isAuthenticatedAtom, loadingAtom, userAtom } from "@/atoms/authSessionAtoms";

export function useAuth() {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [loading] = useAtom(loadingAtom);
  const [user] = useAtom(userAtom);

  return { isAuthenticated, loading, user };
}
