// src/atoms/session/authSessionAtoms.ts
import { atom } from "jotai";
import { User } from "@ignis/types/users";

// Atom for managing authentication state
export const isAuthenticatedAtom = atom(false);
isAuthenticatedAtom.debugLabel = "isAuthenticated";

// Atom for storing previous pathname for redirection
export const previousPathnameAtom = atom<string | null>(null);
previousPathnameAtom.debugLabel = "previousPathname";
// Atom for storing user data
export const userAtom = atom<User | null>(null);
userAtom.debugLabel = "user";
// Atom to manage the loading state during authentication checks
export const loadingAtom = atom(true);
loadingAtom.debugLabel = "authIsLoading";
// Effect atom to clear `userAtom` if `isAuthenticatedAtom` is set to `false`
export const authEffectAtom = atom(
  (get) => get(isAuthenticatedAtom), // Read the current authentication state
  (_, set, newAuthState: boolean) => {
    set(isAuthenticatedAtom, newAuthState); // Update the `isAuthenticatedAtom`

    // If `isAuthenticatedAtom` is set to `false`, clear `userAtom`
    if (!newAuthState) {
      set(userAtom, null);
    }
  },
);

authEffectAtom.debugLabel = "authEffect";
