import { DiscordConfig } from "@/types/config.types";
import { getEnvVariable } from "@/utils/config.utils";

export const getDiscordConfig = (): DiscordConfig => ({
  clientId: getEnvVariable("DISCORD_CLIENT_ID"),
  clientSecret: getEnvVariable("DISCORD_CLIENT_SECRET"),
  callbackUrl: getEnvVariable("DISCORD_CLIENT_CALLBACK_URL"),
});
