// src/atoms/authSessionAtoms.ts

import { adminOverwriteRoles, adminOverwrittenRoles } from "@/atoms/adminAtoms";
import { ATOM_KEYS } from "@/config/constants";
import { User } from "@packages/types/users";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Atom for managing authentication state
export const isAuthenticatedAtom = atom(false);
isAuthenticatedAtom.debugLabel = "auth:isAuthenticated";

// Atom for storing previous pathname for redirection
export const previousPathnameAtom = atomWithStorage<string | null>(ATOM_KEYS.AUTH_REDIRECT_PATH, null, undefined, {
  getOnInit: true,
});
previousPathnameAtom.debugLabel = "auth:previousPathname";

// Atom for storing user data
export const userAtom = atom<User | null>(null);
userAtom.debugLabel = "auth:user";

// Atom to manage the loading state during authentication checks
export const loadingAtom = atom(true);
loadingAtom.debugLabel = "auth:isLoading";

// Effect atom to clear `userAtom` if `isAuthenticatedAtom` is set to `false`
export const authEffectAtom = atom(
  (get) => get(isAuthenticatedAtom), // Read the current authentication state
  (_, set, newAuthState: boolean) => {
    set(isAuthenticatedAtom, newAuthState); // Update the `isAuthenticatedAtom`

    // If `isAuthenticatedAtom` is set to `false`, clear `userAtom`
    if (!newAuthState) {
      set(userAtom, null);
      set(userRolesAtom, []);
      set(originalUserRolesAtom, []);
    }
  },
);

authEffectAtom.debugLabel = "auth:authEffect";

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
