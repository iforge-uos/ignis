import { ATOM_KEYS } from "@/config/constants.ts";
import { atomWithStorage } from "jotai/utils";

export const adminOverwrittenRoles = atomWithStorage<string[]>(ATOM_KEYS.ADMIN_OVERWRITTEN_ROLES, [], undefined, {
  getOnInit: true,
});
adminOverwrittenRoles.debugLabel = "admin:overwrittenUserRoles";

export const adminOverwriteRoles = atomWithStorage<boolean>(ATOM_KEYS.ADMIN_OVERWRITE_ROLES, false, undefined, {
  getOnInit: true,
});
adminOverwriteRoles.debugLabel = "admin:overwriteRoles";
