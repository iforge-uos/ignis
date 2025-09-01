import { REST as DiscordRest } from "@discordjs/rest";
import { Octokit } from "@octokit/rest";
import e, { $infer } from "@packages/db/edgeql-js";
import { RESTGetAPIUserResult, Routes } from "discord-api-types/v10";
import z from "zod";
import env from "@/lib/env";
import { auth } from "@/orpc";

const octokit = new Octokit({ auth: env.oauth.github.token });
const discord = new DiscordRest().setToken(env.oauth.discord.token);

export const IntegrationShape = e.shape(e.users.Integration, () => ({ external_id: true, platform: true }));

export const resolveIntegrations = <T extends $infer<typeof IntegrationShape>[number]>(integrations: T[]) =>
  Promise.all(
    integrations.map(async (integration) => {
      switch (integration.platform) {
        case "GITHUB": {
          const { data } = await octokit.rest.users.getById({
            account_id: Number.parseInt(integration.external_id),
          });
          return { ...integration, platform: integration.platform, data };
        }
        case "DISCORD": {
          const data = (await discord.get(Routes.user(integration.external_id))) as RESTGetAPIUserResult;
          return { ...integration, platform: integration.platform, data };
        }
      }
    }),
  );

export const integrations = auth
  .route({ method: "GET", path: "/integrations" })
  .input(z.object({ id: z.uuid() }))
  .handler(async ({ input: { id }, context: { db } }) =>
    e
      .select(e.users.Integration, (integration) => ({
        ...IntegrationShape(integration),
        filter: e.op(integration.user.id, "=", e.uuid(id)),
      }))
      .run(db)
      .then(resolveIntegrations),
  );
