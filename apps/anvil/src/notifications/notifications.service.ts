import { EdgeDBService } from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import { MailingList } from "@ignis/types/notifications";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly dbService: EdgeDBService,
    private readonly logger: Logger,
  ) {}

  async getMailingLists(includeSubscribers = false): Promise<MailingList[]> {
    return await this.dbService.query(
      e.select(e.notification.MailingList, () => ({
        subscribers: includeSubscribers,
        id: true,
        name: true,
        description: true,
        updated_at: true,
        created_at: true,
      })),
    );
  }

  async getMailingList(id: string): Promise<MailingList> {
    return await this.dbService.query(
      e.assert_exists(
        e.select(e.notification.MailingList, () => ({ ...e.notification.MailingList["*"], filter_single: { id } })),
      ),
    );
  }
}
