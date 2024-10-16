import { LdapConfig } from "@/types/config.types";
import { getEnvVariable, getEnvNumber, getEnvBoolean, getEnvArray } from "@/utils/config.utils";

export const getLdapConfig = (): LdapConfig => ({
  host: getEnvVariable("LDAP_HOST"),
  port: getEnvNumber("LDAP_PORT"),
  base: getEnvVariable("LDAP_BASE"),
  user: getEnvVariable("LDAP_USER"),
  pass: getEnvVariable("LDAP_PASS"),
  defaultAttributes: getEnvArray("LDAP_DEFAULT_ATTRIBUTES"),
  ssl: getEnvBoolean("LDAP_SSL"),
});
