import { AuthConfig } from "./types";
import { getEnvArray, getEnvVariable } from "@/utils/config.utils";

export const getAuthConfig = (): AuthConfig => ({
  csrfSecret: getEnvVariable("CSRF_SECRET"),
  csrfExcludeRoutes: getEnvArray("CSRF_EXCLUDE_ROUTES"),
  adminRole: getEnvVariable("ADMIN_ROLE"),
});
