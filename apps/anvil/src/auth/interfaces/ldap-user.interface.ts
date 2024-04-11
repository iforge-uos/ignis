export interface LdapUser {
  dn: string;
  /** User's id */
  uid: string;
  cn: string;
  /** User's surname */
  sn: string;
  initials: string;
  /** User's organisational unit */
  ou: string;
  /** User's email */
  mail: string;
  /** User's first name */
  givenName: string;
  shefReportingFaculty: string;
  userPrincipalName: string;
  "mS-DS-ConsistencyGuid"?: string;
}
