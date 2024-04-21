import { LdapUser } from "@/auth/interfaces/ldap-user.interface";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import * as ldap from "ldapjs";

const LdapUserFields = ["givenName", "sn", "mail", "uid", "shefLibraryNumber", "ou"];

@Injectable()
export class LdapService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LdapService.name);
  private client: ldap.Client | null;

  constructor() {
    this.client = null;
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.unbind();
  }

  async connect() {
    if (!this.client) {
      this.logger.debug("Attempting to create an LDAP client...");
      this.client = ldap.createClient({
        url: "ldaps://adldap.shef.ac.uk:636"!,
        connectTimeout: 2_000,
        timeout: 5_000,
      });

      this.client.on("connect", () => {
        this.logger.log("Successfully connected to LDAP server.");
      });

      this.client.on("error", (err) => {
        this.logger.error(`LDAP connection error: ${err.message}`);
        this.client = null; // Reset the client to reconnect later.
      });

      await this.bind(process.env.LDAP_EMAIL!, process.env.LDAP_PASSWORD!);
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

  private async unbind(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.client!.unbind((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }),
    );
  }

  async ensureConnected() {
    if (!this.client?.connected) {
      this.logger.debug("Re-establishing LDAP client connection...");
      await this.connect();
    }
  }

  async resetConnection() {
    if (this.client) {
      try {
        await this.unbind();
      } catch (err) {
        if (err) {
          this.logger.error(`Error unbinding LDAP client: ${(err as any).message}`);
        }
        this.client = null;
        this.logger.debug("LDAP client unbound and reset.");
      }
    }
    await this.connect();
  }

  private async search(base: string, options: ldap.SearchOptions): Promise<ldap.SearchEntry[]> {
    this.logger.debug(`Performing search with base: ${base} and filter: ${options.filter}`);
    await this.resetConnection(); // Reset connection before each search
    return new Promise((resolve, reject) => {
      this.client!.search(base, options, (err, res) => {
        if (err) {
          this.logger.error(`Search initiation error: ${err.message}`);
          reject(err);
          return;
        }

        const results: ldap.SearchEntry[] = [];
        res.on("searchEntry", (entry) => {
          this.logger.debug(`Received entry: ${entry.dn.toString()}`);
          results.push(entry);
        });
        res.on("end", () => {
          this.logger.debug(`Search completed, found ${results.length} entries.`);
          resolve(results);
        });
        res.on("error", (error) => {
          this.logger.error(`Search stream error: ${error.message}`);
          reject(error);
        });
        // Timeout handler to avoid hanging
        res.on("timeout", () => {
          this.logger.error("Search request timed out.");
          reject(new Error("LDAP search request timed out"));
        });
      });
    });
  }

  async authenticate(uid: string, password: string): Promise<boolean> {
    this.logger.debug(`Authenticating user with UID: ${uid}`);
    await this.ensureConnected();

    const results = await this.search(process.env.LDAP_BASE!, {
      filter: `(&(objectclass=person)(uid=${uid}))`,
      scope: "sub",
      attributes: ["dn"],
    });
    if (results.length === 0) {
      return false;
    }

    const userDn = results[0].dn.toString();
    await this.bind(userDn, password);
    return true;
  }

  // query params can go by mail, uid
  async lookup(searchFilter: string, attributes: string[] | undefined = undefined): Promise<LdapUser | null> {
    await this.ensureConnected();
    this.logger.debug(`Looking up entries with filter: ${searchFilter}`);
    const searchBase = process.env.LDAP_BASE!;
    const options: ldap.SearchOptions = {
      filter: searchFilter,
      scope: "sub",
      attributes: LdapUserFields,
      timeLimit: 10,
    };

    const results = await this.search(searchBase, options);
    this.logger.debug(`LDAP search completed for ${searchFilter}`);
    const result = results.length > 0 ? results[0] : null;
    if (!result) {
      return null;
    }
    return Object.fromEntries(
      result.attributes.map((attr) => {
        return [attr.type, attr.values[0]];
      }),
    ) as any;
  }

  async lookupUsername(username: string) {
    return await this.lookup(`(&(objectclass=person)(uid=${username}))`);
  }

  async lookupEmail(email: string): Promise<LdapUser | null> {
    return await this.lookup(`(&(objectclass=person)(mail=${email}))`);
  }

  async lookupUCard(ucard_number: number): Promise<LdapUser | null> {
    return await this.lookup(`(&(objectclass=person)(sheflibrarynumber=${ucard_number.toString().padStart(9, "0")}))`);
  }
}
