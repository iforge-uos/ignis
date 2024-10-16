import { GoogleConfig } from "@/types/config.types";
import { getEnvVariable } from "@/utils/config.utils";

export const getGoogleConfig = (): GoogleConfig => ({
  clientId: getEnvVariable("GOOGLE_CLIENT_ID"),
  clientSecret: getEnvVariable("GOOGLE_CLIENT_SECRET"),
  callbackUrl: getEnvVariable("GOOGLE_CLIENT_CALLBACK_URL"),
  serviceAccountEmail: getEnvVariable("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
  serviceAccountPrivateKey: getEnvVariable("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"),
});
