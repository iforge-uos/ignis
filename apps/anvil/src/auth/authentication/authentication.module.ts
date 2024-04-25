import { Logger, Module } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { UsersModule } from "@/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LdapModule } from "@/ldap/ldap.module";
import { DiscordStrategy } from "./strategies/discord.strategy";
import { LdapAuthStrategy } from "./strategies/ldap.strategy";
import { JwtModule } from "@nestjs/jwt";
import { IntegrationsModule } from "@/users/integrations/integrations.module";
import { BlacklistService } from "./blacklist/blacklist.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
  imports: [
    EdgeDBModule,
    UsersModule,
    PassportModule,
    LdapModule,
    IntegrationsModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        },
      }),
    }),
  ],
  providers: [
    AuthenticationService,
    DiscordStrategy,
    GoogleStrategy,
    LdapAuthStrategy,
    BlacklistService,
    JwtStrategy,
    Logger,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
