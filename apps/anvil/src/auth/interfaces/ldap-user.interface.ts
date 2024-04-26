export interface LdapUser {
  dn: string;
  cn: string;
  /** User's organisational unit */
  ou: string;
  /** User's surname */
  sn: string;
  /** User's first name */
  givenName: string;
  initials: string;
  /** User's email */
  mail: string;
  uid: string;
  shefLibraryNumber: string;
}
