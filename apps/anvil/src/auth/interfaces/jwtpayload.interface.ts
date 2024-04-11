export interface JwtPayload {
  sub: string; // Subject (usually the user ID)
  uid: string; // A secondary ID or username, if required
  roles?: string[]; // Roles, if you're using role-based access control
  iat?: number; // Issued At - usually automatically set by the JWT library
  exp?: number; // Expiry - usually automatically set by the JWT library
  jti?: string; // JWT ID, can be used for token revocation
  [namespace: string]: any; // To allow for any custom namespaced claims
}
