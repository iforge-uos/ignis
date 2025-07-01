import config from "@/lib/env/server";
import { sleep } from "@/lib/utils";
import { ldapLibraryToUcardNumber, removeDomain } from "@/lib/utils/sign-in";
import e from "@packages/db/edgeql-js";
import { logger } from "@sentry/node";
import { Client, Entry } from "ldapts";
import { z } from "zod/v4";

function escapeLDAPFilterCharacters(str: string): string {
  return str.replace(/([\\*\(\)\!\&\|\=><~])/g, "\\$1");
}

export const LdapUserSchema = z.object({
  /** User's organisational unit */
  ou: z.string(),
  /** User's surname */
  sn: z.string(),
  /** User's first name */
  givenName: z.string(),
  /** User's email */
  mail: z.string(),
  /** User's username */
  uid: z.string(),
  /** User's UCard Number */
  shefLibraryNumber: z.string(),
});

export type LdapUser = z.infer<typeof LdapUserSchema>;
type Lookup = <FieldsT extends (keyof LdapUser)[]>(
  arg0: string,
  attributes?: FieldsT,
) => Promise<Pick<LdapUser, FieldsT[number]> | null>;

class UoSClient extends Client {
  private defaultAttributes = Object.keys(LdapUserSchema.def.shape) as (keyof LdapUser)[];
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  constructor() {
    super({
      url: `ldap${config.ldap.ssl ? "s" : ""}://${config.ldap.host}:${config.ldap.port}`,
      connectTimeout: 5_000,
      timeout: 10_000,
    });
  }

  async connect() {
    await this.bind(config.ldap.user, config.ldap.pass);
  }

  private async reconnect(): Promise<void> {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      logger.trace(`Attempting to reconnect to LDAP server (retry ${this.retryCount})`);
      await sleep(this.retryDelay);
      await this.connect();
    } else {
      logger.error("Maximum retry count reached. Unable to connect to LDAP server.");
      throw new Error("Maximum retry count reached. Unable to connect to LDAP server.");
    }
  }

  async lookup<FieldsT extends (keyof LdapUser)[]>(
    searchFilter: string,
    attributes = this.defaultAttributes as any,
  ): Promise<Pick<LdapUser, FieldsT[number]>[]> {
    if (!this.isConnected) {
      this.connect();
    }
    let searchEntries: Entry[];
    // let searchReferences: any;

    try {
      const searchResult = await this.search(config.ldap.base, {
        scope: "sub",
        filter: searchFilter,
        attributes,
      });
      searchEntries = searchResult.searchEntries;
    } catch {
      await this.reconnect();
      return await this.lookup(searchFilter, attributes);
    }
    return z.array(LdapUserSchema.partial()).parse(searchEntries) as any;
  }

  lookupByUsername: Lookup = async (username: string, attributes: string[] = this.defaultAttributes) => {
    logger.debug(logger.fmt`Looking up user by username: ${username}`);

    const searchFilter = `(&(objectClass=person)(uid=${escapeLDAPFilterCharacters(username)}))`;
    const result = await this.lookup(searchFilter, attributes as any);
    if (!result.length) return null;
    return result[0] as any;
  };

  lookupByEmail: Lookup = async (email: string, attributes: string[] = this.defaultAttributes) => {
    logger.debug(logger.fmt`Looking up user by email: ${email}`);

    const searchFilter = `(&(objectClass=person)(mail=${escapeLDAPFilterCharacters(email)}))`;
    const result = await this.lookup(searchFilter, attributes as any);
    if (!result.length) return null;
    return result[0] as any;
  };

  lookupByUcardNumber: Lookup = async (ucardNumber: string, attributes: string[] = this.defaultAttributes) => {
    logger.debug(logger.fmt`Looking up user by ucard number: ${ucardNumber.slice(3)}`);

    const searchFilter = `(&(objectClass=person)(shefLibraryNumber=${escapeLDAPFilterCharacters(ucardNumber)}))`;
    const result = await this.lookup(searchFilter, attributes as any);
    if (!result.length) return null;
    return result[0] as any;
  };

  toInsert(user: LdapUser) {
    return {
      username: user.uid,
      email: removeDomain(user.mail).toLowerCase(),
      first_name: user.givenName,
      last_name: user.sn,
      organisational_unit: user.ou,
      roles: e.select(e.users.Role, () => ({ filter_single: { name: "User" } })),
      ucard_number: ldapLibraryToUcardNumber(user.shefLibraryNumber),
    };
  }
}

const client = new UoSClient();
export default client;
