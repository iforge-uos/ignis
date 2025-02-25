import { LocationName } from "@ignis/types/training";

export const USER_EMAIL_DOMAIN = "sheffield.ac.uk";

export const SIGN_IN_REASONS_STORAGE_KEY = "sign_in_reasons";

export const iForgeEpoch = new Date(Date.UTC(2017, 0, 1));

export const locationNameToCSSName = (location: LocationName | Lowercase<LocationName>): string => {
  switch (location.toLowerCase()) {
    case "mainspace":
      return "mainspace";
    case "heartspace":
      return "heartspace";
    case "george_porter":
      return "george-porter";
    default:
      throw new Error(`Unreachable ${location}`);
  }
};

export const ATOM_KEYS = {
  AUTH_REDIRECT_PATH: "Ignis:authRedirectPath",
  ADMIN_OVERWRITTEN_ROLES: "Ignis:adminOverwrittenRoles",
  ADMIN_OVERWRITE_ROLES: "Ignis:adminOverwriteRoles",
};

export const AVAILABLE_ROLES = ["admin", "rep"];
