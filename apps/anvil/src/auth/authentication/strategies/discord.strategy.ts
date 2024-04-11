import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-discord";
import { IntegrationsService } from "@/users/integrations/integrations.service";
import * as process from "process";
import { EdgeDBService } from "@/edgedb/edgedb.service";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
  private readonly integrationService: IntegrationsService;

  constructor(private readonly dbService: EdgeDBService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CLIENT_CALLBACK_URL,
      scope: ["identify", "email"],
    });
    this.integrationService = new IntegrationsService(this.dbService);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    done: Function,
  ) {
    // Here, you can extract the user information from the 'profile' object
    // and do whatever you want with it - e.g., find or create the user in your DB,
    // then call the 'done' callback.
    const user = {
      discordId: profile.id,
      username: profile.username,
      email: profile.email,
    };
    done(null, user); // In Passport terminology, this 'user' will be attached to the request object as 'req.user'.
  }
}
