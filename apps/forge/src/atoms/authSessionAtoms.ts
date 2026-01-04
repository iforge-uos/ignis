// src/atoms/authSessionAtoms.ts

import { User } from "@packages/types/users";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { adminOverwriteRoles, adminOverwrittenRoles } from "@/atoms/adminAtoms";
import { ATOM_KEYS } from "@/lib/constants";
import { Procedures } from "../types/router";

// Atom for storing previous pathname for redirection
export const previousPathnameAtom = atomWithStorage<string | null>(ATOM_KEYS.AUTH_REDIRECT_PATH, null, undefined, {
  getOnInit: true,
});
previousPathnameAtom.debugLabel = "auth:previousPathname";

// Atom for storing user data
export const userAtom = atomWithStorage<Procedures["users"]["me"] | null>(ATOM_KEYS.USER, null, undefined, {
  getOnInit: true,
});
userAtom.debugLabel = "auth:user";


export const originalUserRolesAtom = atom<string[]>([]);
originalUserRolesAtom.debugLabel = "auth:originalRoles";

export const userRolesAtom = atom(
  // Read function
  (get) => {
    const isOverwritten = get(adminOverwriteRoles);
    const overwrittenRoles = get(adminOverwrittenRoles);
    const originalRoles = get(originalUserRolesAtom);

    return isOverwritten ? overwrittenRoles : originalRoles;
  },
  // Write function
  (get, set, newRoles: string[]) => {
    const isOverwritten = get(adminOverwriteRoles);

    if (!isOverwritten) {
      // Only update originalUserRolesAtom if admin overwrite is not active
      set(originalUserRolesAtom, newRoles);
    }
    // If admin overwrite is active, writes to userRolesAtom will be ignored
  },
);
userRolesAtom.debugLabel = "auth:userRoles";
