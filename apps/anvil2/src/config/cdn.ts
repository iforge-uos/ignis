import { CdnConfig } from "./types";
import { getEnvVariable } from "@/utils/config";

export const getCdnConfig = (): CdnConfig => ({
  url: getEnvVariable("CDN_URL"),
});
