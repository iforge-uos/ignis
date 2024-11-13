// src/atoms/session/signInAppAtoms.ts

import { LocationName } from "@ignis/types/sign_in";
import { atom } from "jotai";
import {locationStatus} from "@/services/sign_in/locationService.ts";
import {atomWithQuery} from "jotai-tanstack-query";

export const activeLocationAtom = atom<LocationName>("MAINSPACE");

export const locationStatusesAtom = atomWithQuery(() => ({
    queryKey: ["locationStatus"],
    queryFn: locationStatus,
    staleTime: 4000,
    refetchInterval: 5000,
}));