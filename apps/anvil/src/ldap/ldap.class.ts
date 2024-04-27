import * as ldap from "ldapjs";
import { EventEmitter } from "events";
import { Logger, OnModuleInit } from "@nestjs/common";

export interface LdapWrapperOptions {
  hostName: string;
  port?: number;
  connectTimeout?: number;
  receiveTimeout?: number;
  user?: string;
  password?: string;
  useSSL?: boolean;
  searchBase?: string;
  defaultAttributes?: string[];
}

export class LdapClass extends EventEmitter implements OnModuleInit {
  private readonly logger: Logger;
  private client: ldap.Client | null = null;
  private connected = false;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds
  private readonly hostName: string;
  private readonly port: number;
  private readonly connectTimeout: number;
  private readonly receiveTimeout: number;
  private readonly user: string;
  private readonly password: string;
  private readonly useSSL: boolean;
  private readonly searchBase: string;
  private readonly defaultAttributes: string[];

  constructor(options: LdapWrapperOptions) {
    super();
    this.logger = new Logger(LdapClass.name);
    this.hostName = options.hostName;
    this.port = options.port!;
    this.connectTimeout = options.connectTimeout!;
    this.receiveTimeout = options.receiveTimeout!;
    this.user = options.user!;
    this.password = options.password!;
    this.useSSL = !!options.useSSL;
    this.searchBase = options.searchBase!;
    this.defaultAttributes = options.defaultAttributes!;
    this.connect();
  }

  async onModuleInit() {
    this.connect();
  }

  private connect(): void {
    if (this.connected || this.retryCount >= this.maxRetries) {
      return;
    }

    const url = `${this.useSSL ? "ldaps" : "ldap"}://${this.hostName}:${this.port}`;
    this.logger.log(`Connecting to LDAP server: ${url}`, LdapClass.name);

    this.client = ldap.createClient({
      url,
      connectTimeout: this.connectTimeout,
      timeout: this.receiveTimeout,
      bindDN: this.user,
      bindCredentials: this.password,
      tlsOptions: {
        rejectUnauthorized: true,
        followRedirects: true,
      },
      reconnect: true,
    });

    this.client.on("connect", () => {
      this.connected = true;
      this.retryCount = 0;
      this.logger.log("Connected to LDAP server", LdapClass.name);
      this.emit("connect");
    });

    this.client.on("error", (err) => {
      this.connected = false;
      this.logger.error(`LDAP connection error: ${err.message}`, LdapClass.name);
      this.emit("error", err);
      this.reconnect();
    });

    this.client.on("end", () => {
      this.connected = false;
      this.logger.log("LDAP connection ended", LdapClass.name);
      this.emit("end");
      this.reconnect();
    });
  }

  private reconnect(): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.logger.log(`Attempting to reconnect to LDAP server (retry ${this.retryCount})`, LdapClass.name);
      setTimeout(() => this.connect(), this.retryDelay);
    } else {
      this.logger.error("Maximum retry count reached. Unable to connect to LDAP server.", LdapClass.name);
      this.emit("error", new Error("Maximum retry count reached. Unable to connect to LDAP server."));
    }
  }

  async bind(dn: string, password: string): Promise<void> {
    if (!this.client) {
      throw new Error("LDAP client is not initialized.");
    }

    this.logger.log(`Binding to LDAP server with DN: ${dn}`, LdapClass.name);

    return new Promise((resolve, reject) => {
      this.client!.bind(dn, password, (err) => {
        if (err) {
          this.logger.error(`LDAP bind error: ${err.message}`, LdapClass.name);
          reject(err);
        } else {
          this.logger.log("LDAP bind successful", LdapClass.name);
          resolve();
        }
      });
    });
  }

  async search(base: string, options: ldap.SearchOptions): Promise<ldap.SearchEntry[]> {
    if (!this.client) {
      throw new Error("LDAP client is not initialized.");
    }

    this.logger.log(`Searching LDAP with base: ${base} and filter: ${options.filter}`, LdapClass.name);

    return new Promise((resolve, reject) => {
      const results: ldap.SearchEntry[] = [];

      const searchOptions: ldap.SearchOptions = {
        ...options,
      };

      const searchCallback = async (err: ldap.Error | null, res: ldap.SearchCallbackResponse): Promise<void> => {
        if (err) {
          this.logger.error(`LDAP search error: ${err.message}`, LdapClass.name);
          reject(err);
          return;
        }

        res.on("searchEntry", (entry) => {
          results.push(entry);
        });

        res.on("error", async (err: ldap.Error) => {
          this.logger.error(`LDAP search error: ${err.message}`, LdapClass.name);
          reject(err);
        });

        res.on("end", (result) => {
          if (result?.status === 0) {
            this.logger.log(`LDAP search completed. Found ${results.length} entries.`, LdapClass.name);
            resolve(results);
          } else {
            this.logger.error(`LDAP search ended with status: ${result?.status}`, LdapClass.name);
            reject(new Error(`LDAP search ended with status: ${result?.status}`));
          }
        });
      };

      this.client!.search(base, searchOptions, searchCallback);
    });
  }

  async getDN(searchFilter: string, attributes: string[]): Promise<string> {
    this.logger.log(`Getting DN with filter: ${searchFilter}`, LdapClass.name);

    const searchOptions: ldap.SearchOptions = {
      scope: "sub",
      filter: searchFilter,
      attributes: attributes,
    };

    const results = await this.search(this.searchBase, searchOptions);
    if (results.length === 0) {
      this.logger.warn("No matching entries found", LdapClass.name);
      throw new Error("No matching entries found.");
    }

    const dn = results[0].dn.toString();
    this.logger.log(`Found DN: ${dn}`, LdapClass.name);
    return dn;
  }

  async authenticate(username: string, password: string): Promise<boolean> {
    this.logger.log(`Authenticating user: ${username}`, LdapClass.name);

    const searchFilter = `(uid=${username})`;
    const dn = await this.getDN(searchFilter, ["dn"]);

    try {
      await this.bind(dn, password);
      this.logger.log(`Authentication successful for user: ${username}`, LdapClass.name);
      return true;
    } catch (err) {
      this.logger.error(`Authentication failed for user: ${username}`, LdapClass.name);
      return false;
    }
  }

  async lookup(
    searchFilter: string,
    attributes: string[] = this.defaultAttributes,
    returnAsString = false,
  ): Promise<Record<string, string | string[]> | null> {
    this.logger.log(`Looking up with filter: ${searchFilter}`, LdapClass.name);

    const searchOptions: ldap.SearchOptions = {
      scope: "sub",
      filter: searchFilter,
      attributes: attributes,
    };

    const results = await this.search(this.searchBase, searchOptions);
    if (results.length === 0) {
      this.logger.warn("No matching entries found", LdapClass.name);
      return null;
    }

    const result = results[0];
    const attributesDict: Record<string, string | string[]> = {};

    for (const attribute of attributes) {
      const values = result.attributes.filter((attr) => attr.type === attribute).map((attr) => attr.values[0]);
      if (values.length > 0) {
        attributesDict[attribute] = returnAsString ? values.join(",") : values;
      }
    }

    this.logger.log(`Lookup completed. Found attributes: ${JSON.stringify(attributesDict)}`, LdapClass.name);
    return attributesDict;
  }
  async lookupByUsername(
    username: string,
    attributes: string[] = this.defaultAttributes,
  ): Promise<Record<string, string | string[]> | null> {
    this.logger.log(`Looking up user by username: ${username}`, LdapClass.name);

    const searchFilter = `(&(objectClass=person)(uid=${username}))`;
    return this.lookup(searchFilter, attributes, true);
  }

  async lookupByEmail(
    email: string,
    attributes: string[] = this.defaultAttributes,
  ): Promise<Record<string, string | string[]> | null> {
    this.logger.log(`Looking up user by email: ${email}`, LdapClass.name);

    const searchFilter = `(&(objectClass=person)(mail=${email}))`;
    return this.lookup(searchFilter, attributes, true);
  }

  async lookupByUcardNumber(
    ucardNumber: string,
    attributes: string[] = this.defaultAttributes,
  ): Promise<Record<string, string | string[]> | null> {
    this.logger.log(`Looking up user by ucard number: ${ucardNumber}`, LdapClass.name);

    const searchFilter = `(&(objectClass=person)(shefLibraryNumber=${ucardNumber}))`;
    return this.lookup(searchFilter, attributes, true);
  }
}
