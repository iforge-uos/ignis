// src/atoms/session/signInAppAtoms.ts

import { LocationName } from "@ignis/types/sign_in";
import { atom } from "jotai";
import {locationStatus} from "@/services/sign_in/locationService.ts";
import {atomWithQuery} from "jotai-tanstack-query";
import { SignInSession } from "@/types/sign_in";


// ------ Sign in App Data Management (location data, handling selected location, etc.)

export const activeLocationAtom = atom<LocationName>("MAINSPACE");

export const locationStatusesAtom = atomWithQuery(() => ({
    queryKey: ["locationStatus"],
    queryFn: locationStatus,
    staleTime: 4000,
    refetchInterval: 5000,
}));


// ------ Session Management (for sign in actions && global sign in for users)

export const sessionAtom = atom<SignInSession | null>(null);

export function sessionFieldAtom<KeyT extends keyof SignInSession>(field: KeyT) {
    return atom(
        (get) => get(sessionAtom)?.[field],
        (get, set, update: SignInSession[KeyT]) => {
            const session = get(sessionAtom);
            if (session) {
                set(sessionAtom, {
                    ...session,
                    [field]: update,
                });
            }
        }
    );
}

export const resetSessionAtom = atom(
    null,
    (_get, set, _arg) => {
        set(sessionAtom, null);
    }
);

