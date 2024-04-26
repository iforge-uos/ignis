export interface LdapUser {
  /** User's organisational unit */
  ou: string;
  /** User's surname */
  sn: string;
  /** User's first name */
  givenName: string;
  /** User's email */
  mail: string;
  uid: string;
  shefLibraryNumber: string;
}
