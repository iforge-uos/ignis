// src/atoms/session/signInAppAtoms.ts

import { orpc } from "@/lib/orpc";
import { SignInSession } from "@/types/sign_in";
import { sign_in } from "@packages/db/interfaces";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";

// ------ Sign in App Data Management (location data, handling selected location, etc.)

export const activeLocationAtom = atom<sign_in.LocationName>("MAINSPACE");
activeLocationAtom.debugLabel = "signIn:activeLocation";

export const locationStatusesAtom = atomWithQuery(orpc.locations.statuses.experimental_liveOptions);
locationStatusesAtom.debugLabel = "signIn:locationStatuses";

// ------ Session Management (for sign in actions && global sign in for users)

// Individual atoms with proper typing from the interface
export const sessionUcardNumberAtom = atom<SignInSession["ucard_number"]>("");
sessionUcardNumberAtom.debugLabel = "signInSession:ucardNumber";
export const sessionUserAtom = atom<SignInSession["user"]>(null);
sessionUserAtom.debugLabel = "signInSession:user";
export const sessionSignInReasonAtom = atom<SignInSession["sign_in_reason"]>(null);
sessionSignInReasonAtom.debugLabel = "signInSession:signInReason";
export const sessionTrainingAtom = atom<SignInSession["training"]>(null);
sessionTrainingAtom.debugLabel = "signInSession:training";
export const sessionNavigationBacktrackingAtom = atom<SignInSession["navigation_is_backtracking"]>(false);
sessionNavigationBacktrackingAtom.debugLabel = "signInSession:navigationBacktracking";
export const sessionErroredAtom = atom<SignInSession["session_errored"]>(false);
sessionErroredAtom.debugLabel = "signInSession:sessionErrored";

// Combined session atom
export const sessionAtom = atom(
  (get) =>
    ({
      ucard_number: get(sessionUcardNumberAtom),
      user: get(sessionUserAtom),
      sign_in_reason: get(sessionSignInReasonAtom),
      training: get(sessionTrainingAtom),
      navigation_is_backtracking: get(sessionNavigationBacktrackingAtom),
      session_errored: get(sessionErroredAtom),
    }) satisfies SignInSession,
  (_get, set, newSession: SignInSession | null) => {
    if (newSession === null) {
      // Reset all atoms to their default values
      set(sessionUcardNumberAtom, "");
      set(sessionUserAtom, null);
      set(sessionSignInReasonAtom, null);
      set(sessionTrainingAtom, null);
      set(sessionNavigationBacktrackingAtom, false);
      set(sessionErroredAtom, false);
    } else {
      // Update all atoms with new values
      set(sessionUcardNumberAtom, newSession.ucard_number);
      set(sessionUserAtom, newSession.user);
      set(sessionSignInReasonAtom, newSession.sign_in_reason);
      set(sessionTrainingAtom, newSession.training);
      set(sessionNavigationBacktrackingAtom, newSession.navigation_is_backtracking);
      set(sessionErroredAtom, newSession.session_errored);
    }
  },
);

sessionAtom.debugLabel = "signInSession:session";

// Reset helper
export const resetSessionAtom = atom(null, (_get, set) => {
  set(sessionAtom, null);
});
resetSessionAtom.debugLabel = "signInSession:resetSession";

export const initializeSessionAtom = atom(null, (_get, set, ucardNumber: string) => {
  set(sessionUcardNumberAtom, ucardNumber);
  set(sessionUserAtom, null);
  set(sessionTrainingAtom, null);
  set(sessionSignInReasonAtom, null);
  set(sessionErroredAtom, false);
  set(sessionNavigationBacktrackingAtom, false);
});
initializeSessionAtom.debugLabel = "signInSession:initializeSession";
