import { EdgeDBService } from "@/services/edgedb.service";
import e from "@dbschema/edgeql-js";

export class BlacklistService {
  private edgeDBService: EdgeDBService;

  constructor() {
    this.edgeDBService = EdgeDBService.instance;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.edgeDBService.query(
      e.select(e.auth.BlacklistedToken, () => ({
        filter_single: { token: token },
      })),
    );
    return !!blacklistedToken;
  }

  async addToBlacklist(token: string, expiryDate: Date): Promise<void> {
    await this.edgeDBService.query(
      e.insert(e.auth.BlacklistedToken, {
        token,
        expires: expiryDate,
      }),
    );
  }
}
