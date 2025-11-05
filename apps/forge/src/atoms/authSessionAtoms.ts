// src/atoms/authSessionAtoms.ts

import { User } from "@packages/types/users";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { adminOverwriteRoles, adminOverwrittenRoles } from "@/atoms/adminAtoms";
import { ATOM_KEYS } from "@/lib/constants";

// Atom for managing authentication state
export const isAuthenticatedAtom = atom(false);
isAuthenticatedAtom.debugLabel = "auth:isAuthenticated";

// Atom for storing previous pathname for redirection
export const previousPathnameAtom = atomWithStorage<string | null>(ATOM_KEYS.AUTH_REDIRECT_PATH, null, undefined, {
  getOnInit: true,
});
previousPathnameAtom.debugLabel = "auth:previousPathname";

// Atom for storing user data
export const userAtom = atom<User | null>({
  first_name: "James",
  last_name: "Hilton-Balfe",
  display_name: "James Hilton-Balfe",
  email: "jhilton-balfe1",
  organisational_unit: "IPE",
  profile_picture:
    "https://lh3.googleusercontent.com/a-/ALV-UjVAP0NtWBTgHg--PnHdttWYlRWEMFCPyt-kOoMxB7mNgRYTjoWHXtEWuc8X8RDhSdiJ-eodb6NKrKrgr8hMAgXRAOy227CpDPC-nZqN3a6Igfx2ffqEDZVH_UxgaE6Hrn3tBEXi1k8RBjVphiqX7PSMjXDXpSqob7SRGTnsMAffw1dbk0tdHwR4RtpdBpPNDU8Gf_ehGS2Fwqu5KgSJ_ltlJey8PZjf6mMDdMUdrHTIEoxdDSp4U8-G8Fbl0RmyjZMkE840lalQc3PNWuGPSuO-yRMKlf6l18BYl87TkIaF2C41vCCM7BwYX2cmUd86Nwg6CpoD9sEwJt3HHgiR1xHz2axABp1rtp2TngTbw_wS0JFKGHwBRZMNI3fexLIizxyWhDkMXLiGE9RDVfDHEBBR7k8vEyKYmCvqwToXNNZ2_snaJemfMkPEDFmWxFPj2duzHTBsqZ0Kge-TPLstImGt9h3HznqOyXoe5CjjfoNgA2GTqbshSD13F9AAIOL7Y5LRgtYTI1ZaQ-txsk62biDzfmc-YeSLFAyCr5FL3XRf2JCmL4gI1wstNdfE-26nRAMFiSc3I1PyoI-lsSm-ztBQGHjt5w-MhAeUuPObHEGx28WSWB8nNcLbOd59Tz44j34pDBBYgP8lS-eL_R86icJT8k9eCpMZ2Ka734xTM5QKTpe-15rzwav87kdEJlCfumUrkXGevfEom1OPinSFbM0qymSDOc-14rHBNWFaMKwqBXlprq0Rbzjlvaqkbaak58WS2as9DNalPwfxG322D4doLxAC3un7QxkKtTvz9IvrnqdfK4ZX7ARHwOssltmsxeVWI8-1JpFDtVX9X91ufhibvsN2WVH-PHsorSQVa12-bFPaZ-OAVdv92khVcE14LpBIjgSZUdX2I_wXAG2wbVDn0alpRlp-s80X-a9B7vV8atxOmGxq-XY9hR7R0yDmvvLrb4uqTdKKjk0n84fyvPXi_WOHIBXX=s96-c",
  pronouns: "he/him",
  ucard_number: 786768,
  username: "eik21jh",
  updated_at: "2025-03-28T16:45:53.950Z",
  created_at: "2022-09-28T11:57:13.076Z",
  id: "61363b82-f86c-11ee-8cfe-c7c36799e2a2",
  agreements_signed: [
    {
      id: "5f192486-f86c-11ee-8cfe-1b52ec66a1e0",
      created_at: "2024-04-12T01:31:23.070Z",
      version: 1,
      "@created_at": "2025-02-14T03:08:41.962Z",
      "@version_signed": 1,
    },
    {
      id: "5f0c60d4-f86c-11ee-8cfe-2b55746f63b3",
      created_at: "2024-04-12T01:31:22.986Z",
      version: 2,
      "@created_at": "2025-02-14T03:08:41.962Z",
      "@version_signed": 2,
    },
  ],
  roles: [
    { id: "5ea6d732-f86c-11ee-8cfe-177de0f58b65", name: "Rep" },
    { id: "5ea86cc8-f86c-11ee-8cfe-bfcf9fe5f446", name: "Admin" },
  ],
    notifications: [
      {
        id: "notif-1",
        created_at: "2025-10-20T10:00:00.000Z",
        updated_at: "2025-10-20T10:05:00.000Z",
        targets: [{ id: "user-1", name: "James Hilton-Balfe" }],
        content: "Your account has been updated.",
        delivery_methods: ["email", "in-app"],
        dispatched_at: "2025-10-20T10:10:00.000Z",
        priority: 1,
        status: "sent",
        title: "Account Update",
        type: "info",
        "@acknowledged_at": null,
      },
      {
        id: "notif-2",
        created_at: "2025-10-21T09:00:00.000Z",
        updated_at: "2025-10-21T09:05:00.000Z",
        targets: [{ id: "user-1", name: "James Hilton-Balfe" }],
        content: "Welcome to the mailing list!",
        delivery_methods: ["email"],
        dispatched_at: null,
        priority: 2,
        status: "pending",
        title: "Mailing List Subscription",
        type: "announcement",
        "@acknowledged_at": null
      },
    ],
  mailing_list_subscriptions: [],
});
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
