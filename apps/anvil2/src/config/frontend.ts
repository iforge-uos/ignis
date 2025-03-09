import { FrontendConfig } from "./types";
import { getEnvVariable } from "@/utils/config";

export const getFrontendConfig = (): FrontendConfig => ({
  url: getEnvVariable("FRONT_END_URL"),
});
