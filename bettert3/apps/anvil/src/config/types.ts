import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface LdapConfig {
  host: string;
  port: number;
  base: string;
  user: string;
  pass: string;
  defaultAttributes: string[];
  ssl: boolean;
}

export interface AuthConfig {
  csrfSecret: string;
  csrfExcludeRoutes: string[];
  adminRole: string;
  repRole: string[];
  jwtSecret: string;
}

export interface EmailConfig extends SMTPTransport.Options {
  auth: {
    user: string;
    pass: string;
  };
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

export interface DBConfig {
  globals: {
    INFRACTIONS_WEBHOOK_URL: string;
  };
}

export interface FrontendConfig {
  url: string;
}

export interface AppConfig {
  db: DBConfig;
  ldap: LdapConfig;
  auth: AuthConfig;
  email: EmailConfig;
  redis: RedisConfig;
  cdn: CdnConfig;
  frontend: FrontendConfig;
}
