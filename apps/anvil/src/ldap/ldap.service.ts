import { LdapUser } from "@/auth/interfaces/ldap-user.interface";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as ldap from "ldapjs";

@Injectable()
export class LdapService implements OnModuleInit {
  private readonly logger = new Logger(LdapService.name);
  private client: ldap.Client | null;

  constructor() {
    this.client = null;
  }

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    if (!this.client) {
      this.logger.debug("Attempting to create an LDAP client...");

      this.client = ldap.createClient({
        url: process.env.LDAP_HOST + ":" + process.env.LDAP_PORT,
        connectTimeout: 2_000,
        timeout: 5000,
      });

      this.client.on("connect", () => {
        this.logger.log("Successfully connected to LDAP server.");
      });

      this.client.on("error", (err) => {
        this.logger.error(`LDAP connection error: ${err.message}`);
        this.client = null; // Reset the client to reconnect later.
      });
    } else {
      this.logger.warn("LDAP client already exists. Reusing existing connection.");
    }
  }

  private async bind(dn: string, password: string): Promise<void> {
    await this.ensureConnected();

    this.logger.debug(`Binding to DN: ${dn}`);
    return new Promise((resolve, reject) => {
      this.client!.bind(dn, password, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async ensureConnected() {
    if (!this.client?.connected) {
      this.logger.debug("Re-establishing LDAP client connection...");
      await this.connect();
    }
  }

  private async search(base: string, options: ldap.SearchOptions): Promise<ldap.SearchEntry[]> {
    this.logger.debug(`Performing search with base: ${base} and filter: ${options.filter?.toString() ?? ""}`);
    await this.ensureConnected();
    return new Promise((resolve, reject) => {
      this.client!.search(base, options, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        const results: ldap.SearchEntry[] = [];
        res.on("searchEntry", (entry) => {
          results.push(entry);
        });
        res.on("end", () => {
          resolve(results);
        });
        res.on("error", (error) => {
          reject(error);
        });
      });
    });
  }

  async authenticate(uid: string, password: string): Promise<boolean> {
    this.logger.debug(`Authenticating user with UID: ${uid}`);
    await this.ensureConnected();
    const searchBase = process.env.LDAP_BASE!;
    const options: ldap.SearchOptions = {
      filter: `(&(objectclass=person)(uid=${uid}))`,
      scope: "sub",
      attributes: ["dn"],
    };

    try {
      const results = await this.search(searchBase, options);
      if (results.length === 0) {
        return false;
      }

      const userDn = results[0].dn.toString();
      await this.bind(userDn, password);
      return true;
    } catch (error) {
      throw error; // or handle it more gracefully
    }
  }

  // query params can go by mail, uid
  async lookup(searchFilter: string, attributes: string[] | undefined = undefined): Promise<ldap.SearchEntry[] | null> {
    this.logger.debug(`Looking up entries with filter: ${searchFilter}`);
    const searchBase = process.env.LDAP_BASE!;
    const options: ldap.SearchOptions = {
      filter: searchFilter,
      scope: "sub",
      attributes: attributes,
      timeLimit: 10,
    };

    try {
      const results = await this.search(searchBase, options);
      return results.length > 0 ? results : null;
    } catch (error) {
      throw error;
    }
  }

  async lookupUsername(username: string): Promise<LdapUser | null> {
    await this.ensureConnected();
    this.logger.debug(`Starting LDAP search for username: ${username}`);
    const users = await this.lookup(`(&(objectclass=person)(uid=${username}))`);
    this.logger.debug(`LDAP search completed for username: ${username}`);
    if (!users) {
      return null;
    }
    return Object.fromEntries(
      users[0].attributes.map((attr) => {
        return [attr.type, attr.values[0]];
      }),
    ) as any;
  }

  async lookupEmail(email: string): Promise<LdapUser | null> {
    await this.ensureConnected();
    const users = await this.lookup(`(&(objectclass=person)(mail=${email}))`);
    if (!users) {
      return null;
    }
    return Object.fromEntries(
      users[0].attributes.map((attr) => {
        return [attr.type, attr.values[0]];
      }),
    ) as any;
  }
}
