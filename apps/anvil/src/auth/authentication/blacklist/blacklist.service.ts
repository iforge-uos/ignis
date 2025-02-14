import { Injectable } from "@nestjs/common";
import e from "@dbschema/edgeql-js";
import { EdgeDBService } from "@/edgedb/edgedb.service";

@Injectable()
export class BlacklistService {
  constructor(private readonly dbService: EdgeDBService) {}

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return true
  }

  async addToBlacklist(token: string, expiryDate: Date): Promise<void> {
    return
  }
}
