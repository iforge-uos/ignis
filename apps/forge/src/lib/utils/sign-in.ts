import { sign_in } from "@packages/db/interfaces";
import { type Infraction } from "@packages/types/users";
import { exhaustiveGuard } from ".";

/**
 * Strip the domain from a Sheffield email address
 *
 * @param email - The email address to strip the domain from
 * @returns The email address without the domain
 *
 */
export function removeDomain(email: string): string {
  return email.slice(0, email.length - "@sheffield.ac.uk".length);
}

/**
 * Returns the uCard number from the Library Number
 *
 * @remarks
 * We discard the first 3 characters of the Library Number as they are the issue index (i.e. the amount of times the card has been reissued (in most cases 001))
 *
 * @param shefLibraryNumber - The string representation of the Library Number to parse
 * @returns The parsed number as a Number type.
 *
 */
export function ldapLibraryToUcardNumber(shefLibraryNumber: string): number {
  return Number.parseInt(shefLibraryNumber.slice(3));
}

export function formatInfractions(infractions: Infraction[]) {
  const infractionErrors = [];
  for (const infraction of infractions) {
    switch (infraction.type) {
      case "PERM_BAN":
        infractionErrors.push(`User is permanently banned from the iForge. Reason: ${infraction.reason}`);
        break;
      case "TEMP_BAN":
        infractionErrors.push(
          `User is banned from the iForge for ${infraction.duration}. Reason: ${infraction.reason}`,
        );
        break;
      case "WARNING":
        infractionErrors.push(`User has an unresolved warning. Reason: ${infraction.reason}`);
        break;
      case "RESTRICTION":
        infractionErrors.push(`User has an unresolved restriction. Reason: ${infraction.reason}`);
        break;
      case "TRAINING_ISSUE":
        infractionErrors.push(`User has an unresolved training issue. Reason: ${infraction.reason}`);
        break;
      default:
        exhaustiveGuard(infraction.type);
    }
  }
  return infractionErrors;
}

export function formatReason(reason: Pick<sign_in.Reason, "category" | "name">) {
  return reason.category === "UNIVERSITY_MODULE" ? reason.name.split(" ")[0] : reason.name
}
