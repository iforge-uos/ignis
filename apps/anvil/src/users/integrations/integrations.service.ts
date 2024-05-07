import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import e from "@dbschema/edgeql-js";
import { Platform } from "@dbschema/edgeql-js/modules/users";
import { EdgeDBService } from "@/edgedb/edgedb.service";

@Injectable()
export class IntegrationsService {
  constructor(private readonly dbService: EdgeDBService) {}

  async linkDiscordAccount(userId: string, discordProfile: any) {
    try {
      await this.dbService.query(
        e.insert(e.users.Integration, {
          platform: Platform.DISCORD,
          external_id: discordProfile.id,
          external_email: discordProfile.email,
          user: e.select(e.users.User, () => ({
            filter_single: {
              id: userId,
            },
          })),
        }),
      );
    } catch (error) {
      throw new ConflictException("This Discord account is already linked.");
    }
  }

  async findUserByDiscordId(discordId: string) {
    return await this.dbService.query(
      e.select(e.users.Integration, () => ({
        user: true,
        filter_single: {
          external_id: discordId,
          platform: Platform.DISCORD,
        },
      })),
    );
  }

  async unlinkDiscordAccount(userId: string) {
    return await this.dbService.query(
      e.delete(e.users.Integration, () => ({
        filter_single: {
          user: e.select(e.users.User, () => ({
            filter_single: { id: userId },
          })),
          platform: Platform.DISCORD,
        },
      })),
    );
  }

  async linkGithubAccount(userID: string, githubProfile: any) {}
}
