import { LocationName } from "@packages/types/training";
import { exhaustiveGuard } from ".";

export const USER_EMAIL_DOMAIN = "sheffield.ac.uk";

export const SIGN_IN_REASONS_STORAGE_KEY = "sign_in_reasons";

export const iForgeEpoch = new Date(Date.UTC(2017, 0, 1));

export const locationNameToCSSName = (location: LocationName | Lowercase<LocationName>): string => {
  const name = location.toLowerCase() as Lowercase<LocationName>
  switch (name) {
    case "mainspace":
      return "mainspace";
    case "heartspace":
      return "heartspace";
    case "george_porter":
      return "george-porter";
    default:
      exhaustiveGuard(name)
  }
};

export const ATOM_KEYS = {
  AUTH_REDIRECT_PATH: "Ignis:authRedirectPath",
  ADMIN_OVERWRITTEN_ROLES: "Ignis:adminOverwrittenRoles",
  ADMIN_OVERWRITE_ROLES: "Ignis:adminOverwriteRoles",
};

export const AVAILABLE_ROLES = ["admin", "rep"];
