import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LdapStrategy = require("passport-ldapauth").Strategy;
import { LdapService } from "@/ldap/ldap.service";
import { UsersService } from "@/users/users.service";
import { LdapUser } from "../../interfaces/ldap-user.interface";
import type { User } from "@ignis/types/users";

@Injectable()
export class LdapAuthStrategy extends PassportStrategy(LdapStrategy, "ldap") {
  constructor(
    private readonly ldapService: LdapService,
    private readonly usersService: UsersService,
  ) {
    super({
      server: {
        url: process.env.LDAP_HOST + ":" + process.env.LDAP_PORT,
        searchBase: process.env.LDAP_BASE,
        searchFilter: "(uid={{username}})",
        bindFunction: async (req: any, callback: any) => {
          try {
            const isAuthenticated = await this.ldapService.authenticate(
              req.body.username,
              req.body.password,
            );
            if (isAuthenticated) {
              callback(null, { username: req.body.username });
            } else {
              callback(new UnauthorizedException());
            }
          } catch (error) {
            callback(error);
          }
        },
      },
    });
  }

  async validate(ldapUser: LdapUser): Promise<User> {
    return await this.usersService.createOrFindLdapUser(ldapUser);
  }
}
