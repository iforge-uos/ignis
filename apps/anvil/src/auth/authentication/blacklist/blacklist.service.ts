import { Injectable } from "@nestjs/common";
import e from "@dbschema/edgeql-js";
import { EdgeDBService } from "@/edgedb/edgedb.service";

@Injectable()
export class BlacklistService {
  constructor(private readonly dbService: EdgeDBService) {}

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.dbService.query(
      e.select(e.auth.BlacklistedToken, () => ({
        filter_single: { token: token },
      })),
    );
    return !!blacklistedToken;
  }

  async addToBlacklist(token: string, expiryDate: Date): Promise<void> {
    await this.dbService.query(
      e.insert(e.auth.BlacklistedToken, {
        token,
        expires: expiryDate,
      }),
    );
  }
}
