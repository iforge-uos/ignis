import { Logger } from "winston";

export interface LdapConfig {
  host: string;
  port: number;
  base: string;
  user: string;
  pass: string;
  defaultAttributes: string[];
  ssl: boolean;
}

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
}

export interface DiscordConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface AuthConfig {
  jwtSecret: string;
  csrfSecret: string;
  csrfExcludeRoutes: string[];
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  adminRole: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  localDomain: string;
  smtpRequireTls: boolean;
  rateMax: number;
  rateDuration: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  db: string;
  password: string;
}

export interface CdnConfig {
  url: string;
}

export interface FrontendConfig {
  url: string;
}

export interface LoggingConfig {
  level: string;
  logger: Logger;
}

export interface AppConfig {
  ldap: LdapConfig;
  google: GoogleConfig;
  discord: DiscordConfig;
  auth: AuthConfig;
  email: EmailConfig;
  redis: RedisConfig;
  cdn: CdnConfig;
  frontend: FrontendConfig;
  logging: LoggingConfig;
}
