import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth2";
import { IntegrationsService } from "@/users/integrations/integrations.service";
import * as process from "process";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import { UsersService } from "@/users/users.service";
import { GoogleUser } from "@/auth/interfaces/google-user.interface";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly integrationService: IntegrationsService;

  constructor(
    private readonly dbService: EdgeDBService,
    private readonly userService: UsersService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_URL,
      scope: ["email", "profile"],
      // scope: ["email", "profile", "user.organization.read"],  // maybe some day we can be rid of LDAP by reading this data from google
    });
    this.integrationService = new IntegrationsService(this.dbService);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleUser,
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    done: Function,
  ) {
    const user = await this.userService.createOrFindUser(profile);
    done(null, user);
  }
}
