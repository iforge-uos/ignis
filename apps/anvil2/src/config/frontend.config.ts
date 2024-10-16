import { FrontendConfig } from "@/types/config.types";
import { getEnvVariable } from "@/utils/config.utils";

export const getFrontendConfig = (): FrontendConfig => ({
  url: getEnvVariable("FRONT_END_URL"),
});
