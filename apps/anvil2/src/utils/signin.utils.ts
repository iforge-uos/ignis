/**
 * Stripe the domain from a Sheffield email address
 *
 * @param email - The email address to strip the domain from
 * @returns The email address without the domain
 *
 */
export function removeDomain(email: string): string {
  return email.slice(0, email.length - "@sheffield.ac.uk".length);
}

/**
 * Returns the uCard number from the Libary Number
 *
 * @remarks
 * We discard the first 3 characters of the Library Number as they are the issue index (i.e. the amount of times the card has been reissued (in most cases 001))
 *
 * @param shefLibraryNumber - The string represetnation of the Library Number to parse
 * @returns The parsed number as a Number type.
 *
 */
export function ldapLibraryToUcardNumber(shefLibraryNumber: string): number {
  return Number.parseInt(shefLibraryNumber.slice(3));
}
