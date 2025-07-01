import { originalUserRolesAtom } from "@/atoms/authSessionAtoms";
import { useAtom } from "jotai";

export function useOriginalUserRoles() {
  const [originalUserRoles] = useAtom(originalUserRolesAtom);
  return originalUserRoles;
}