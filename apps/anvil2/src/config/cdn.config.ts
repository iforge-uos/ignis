import { CdnConfig } from "@/types/config.types";
import { getEnvVariable } from "@/utils/config.utils";

export const getCdnConfig = (): CdnConfig => ({
  url: getEnvVariable("CDN_URL"),
});
