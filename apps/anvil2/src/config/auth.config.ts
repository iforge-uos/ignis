import { AuthConfig } from "@/types/config.types";
import { getEnvVariable, getEnvArray } from "@/utils/config.utils";

export const getAuthConfig = (): AuthConfig => ({
  jwtSecret: getEnvVariable("JWT_SECRET"),
  csrfSecret: getEnvVariable("CSRF_SECRET"),
  csrfExcludeRoutes: getEnvArray("CSRF_EXCLUDE_ROUTES"),
  accessTokenExpiresIn: getEnvVariable("ACCESS_TOKEN_EXPIRES_IN"),
  refreshTokenExpiresIn: getEnvVariable("REFRESH_TOKEN_EXPIRES_IN"),
  adminRole: getEnvVariable("ADMIN_ROLE"),
});
