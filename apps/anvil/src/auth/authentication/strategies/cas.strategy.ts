import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CasStrategy = require("passport-cas2").Strategy;
import { UsersService } from "@/users/users.service";
import type { User } from "@ignis/types/users";

@Injectable()
export class CasAuthStrategy extends PassportStrategy(CasStrategy, "cas") {
  constructor(private readonly usersService: UsersService) {
    super({
      casURL: "/cas",
      propertyMap: {
        id: "guid",
        givenName: "givenname",
        familyName: "surname",
        emails: "defaultmail",
      },
      function(username: any, profile: any, done: any) {
        console.log("username", username);
      },
    });
  }

  // async validate(ldapUser: LdapUser): Promise<User> {
  //   return await this.usersService.createOrFindUser(ldapUser);
  // }
}
