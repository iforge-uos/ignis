import { EmailConfig } from "@/types/config.types";
import { getEnvVariable, getEnvNumber, getEnvBoolean } from "@/utils/config.utils";

export const getEmailConfig = (): EmailConfig => ({
  host: getEnvVariable("EMAIL_HOST"),
  port: getEnvNumber("EMAIL_PORT"),
  user: getEnvVariable("EMAIL_USER"),
  pass: getEnvVariable("EMAIL_PASS"),
  from: getEnvVariable("EMAIL_FROM"),
  localDomain: getEnvVariable("EMAIL_LOCAL_DOMAIN"),
  smtpRequireTls: getEnvBoolean("EMAIL_SMTP_REQUIRE_TLS"),
  rateMax: getEnvNumber("EMAIL_RATE_MAX"),
  rateDuration: getEnvNumber("EMAIL_RATE_DURATION"),
});
