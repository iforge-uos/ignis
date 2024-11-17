import { useUser } from "@/lib/utils";

/**
 * Retrieves the roles of the current user in lowercase.
 *
 * @returns {string[]} An array of roles in lowercase.
 * Returns an empty array if the user has no roles.
 */
export function useUserRoles(): string[] {
  const user = useUser();

  // If the user object or user roles are not defined, return an empty array
  if (!user?.roles) {
    return [];
  }

  // Map through user roles and convert each role to lowercase
  return user.roles.map((role) => role.name.toLowerCase());
}