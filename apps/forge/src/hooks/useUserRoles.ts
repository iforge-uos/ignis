import { useUser } from "@/lib/utils";

export function useUserRoles(): string[] {
  const user = useUser();

  if (!user?.roles) {
    return [];
  }

  return user.roles.map((role) => role.name.toLowerCase());
}
