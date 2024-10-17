import { Strategy as DiscordStrategy } from "passport-discord";

import { EdgeDBService } from "@/services/edgedb.service";
import config from "@/config";
import { IntegrationsService } from "@/services/integrations.service";

export class DiscordStrategyConfig {
  private readonly integrationService: IntegrationsService;

  constructor(private readonly dbService: EdgeDBService) {
    this.integrationService = new IntegrationsService(this.dbService);
  }

  getStrategy() {
    return new DiscordStrategy(
      {
        clientID: config.discord.clientId,
        clientSecret: config.discord.clientSecret,
        callbackURL: config.discord.callbackUrl,
        scope: ["identify", "email"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          // Here, you can extract the user information from the 'profile' object
          // and do whatever you want with it - e.g., find or create the user in your DB,
          // then call the 'done' callback.
          const user = {
            discordId: profile.id,
            username: profile.username,
            email: profile.email,
          };

          // You might want to use this.integrationService here to handle user creation/update
          // const updatedUser = await this.integrationService.handleDiscordUser(user);

          done(null, user); // In Passport terminology, this 'user' will be attached to the request object as 'req.user'.
        } catch (error) {
          done(error);
        }
      },
    );
  }
}
