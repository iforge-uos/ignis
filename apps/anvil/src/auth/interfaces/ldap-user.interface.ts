export interface LdapUser {
  /** User's id */
  uid: string;
  /** User's surname */
  sn: string;
  /** User's organisational unit */
  ou: string;
  /** User's email */
  mail: string;
  /** User's first name */
  givenName: string;
}
