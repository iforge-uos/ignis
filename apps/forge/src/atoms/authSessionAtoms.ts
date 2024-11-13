// src/atoms/session/authSessionAtoms.ts
import { atom } from "jotai";
import { User } from "@ignis/types/users";

// Atom for managing authentication state
export const isAuthenticatedAtom = atom(false);

// Atom for storing previous pathname for redirection
export const previousPathnameAtom = atom<string | null>(null);

// Atom for storing user data
export const userAtom = atom<User | null>(null);

// Atom to manage the loading state during authentication checks
export const loadingAtom = atom(true);

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
