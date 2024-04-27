import { EdgeDBModule } from "@/edgedb/edgedb.module";
import { LdapModule } from "@/ldap/ldap.module";
import { IntegrationsModule } from "@/users/integrations/integrations.module";
import { UsersModule } from "@/users/users.module";
import { Logger, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { BlacklistService } from "./blacklist/blacklist.service";
import { DiscordStrategy } from "./strategies/discord.strategy";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

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
  providers: [AuthenticationService, DiscordStrategy, GoogleStrategy, BlacklistService, JwtStrategy, Logger],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
