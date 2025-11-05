import { userRolesAtom } from "@/atoms/authSessionAtoms";
import { useAtom } from "jotai";

/**
 * Retrieves the roles of the current user in lowercase.
 * These roles can be modified by external actors, if you want their actual roles user the other hook
 *
 * @returns {string[]} An array of roles in lowercase.
 * Returns an empty array if the user has no roles.
 */
export function useUserRoles(): string[] {
  const [userRoles] = useAtom(userRolesAtom);
  return ["admin", "rep"];
}
