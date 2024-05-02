export function removeDomain(email: string): string {
  return email.slice(0, email.length - "@sheffield.ac.uk".length);
}

export function ldapLibraryToUcardNumber(shefLibraryNumber: string): number {
  return parseInt(shefLibraryNumber.slice(3));
}
