import { LdapUser } from "@/auth/interfaces/ldap-user.interface";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as ldap from "ldapjs";
import { LdapClass } from "@/ldap/ldap.class";

@Injectable()
export class LdapService {
  private readonly logger = new Logger(LdapService.name);

  constructor(private readonly ldapClass: LdapClass) {}

  async authenticate(username: string, password: string): Promise<boolean> {
    this.logger.log(`Authenticating user: ${username}`);
    const result = await this.ldapClass.authenticate(username, password);
    this.logger.log(`Authentication result for user ${username}: ${result}`);
    return result;
  }

  async findUserByUsername(username: string): Promise<LdapUser | null> {
    this.logger.log(`Looking up user by username: ${username}`);
    const result = await this.ldapClass.lookupByUsername(username);
    if (result) {
      const user = this.formatLdapUser(result);
      this.logger.log(`Found user by username ${username}:`, user);
      return user;
    }
    this.logger.log(`User not found by username: ${username}`);
    return null;
  }

  async findUserByEmail(email: string): Promise<LdapUser | null> {
    this.logger.log(`Looking up user by email: ${email}`);
    const result = await this.ldapClass.lookupByEmail(email);
    if (result) {
      const user = this.formatLdapUser(result);
      this.logger.log(`Found user by email ${email}:`, user);
      return user;
    }
    this.logger.log(`User not found by email: ${email}`);
    return null;
  }

  async findUserByUcardNumber(ucardNumber: string): Promise<LdapUser | null> {
    this.logger.log(`Looking up user by ucard number: ${ucardNumber}`);
    const result = await this.ldapClass.lookupByUcardNumber(ucardNumber);
    if (result) {
      const user = this.formatLdapUser(result);
      this.logger.log(`Found user by ucard number ${ucardNumber}:`, user);
      return user;
    }
    this.logger.log(`User not found by ucard number: ${ucardNumber}`);
    return null;
  }

  private formatLdapUser(result: Record<string, string | string[]>): LdapUser {
    this.logger.log(`Formatting response ${JSON.stringify(result)}`);
    return {
      dn: result.dn as string,
      uid: result.uid as string,
      cn: result.cn as string,
      sn: result.sn as string,
      initials: result.initials as string,
      ou: result.ou as string,
      mail: result.mail as string,
      givenName: result.givenName as string,
      shefLibraryNumber: result.shefLibraryNumber as string,
    };
  }
}
