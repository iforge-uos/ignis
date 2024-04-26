import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LdapService } from "./ldap.service";
import { LdapClass } from "./ldap.class";

@Module({
  imports: [ConfigModule],
  providers: [
    LdapService,
    {
      provide: LdapClass,
      useFactory: (configService: ConfigService) => {
        const defaultAttributes = configService
          .get<string>("LDAP_DEFAULT_ATTRIBUTES", "givenName,sn,mail,uid,shefLibraryNumber")
          .split(",");

        return new LdapClass({
          hostName: configService.get<string>("LDAP_HOST")!,
          port: configService.get<number>("LDAP_PORT"),
          user: configService.get<string>("LDAP_USER"),
          password: configService.get<string>("LDAP_PASS"),
          searchBase: configService.get<string>("LDAP_BASE"),
          connectTimeout: 5_000,
          receiveTimeout: 10_000,
          useSSL: configService.get<boolean>("LDAP_SSL", true),
          defaultAttributes: defaultAttributes,
        });
      },

      inject: [ConfigService],
    },
  ],
  exports: [LdapService, LdapClass],
})
export class LdapModule {}
