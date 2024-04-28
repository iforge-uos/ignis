//region Imports
import { Injectable, Logger } from "@nestjs/common";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import { MailingList } from "@ignis/types/notifications";

//region EdgeDB Helpers




@Injectable()
export class NotificationsService {
  constructor(
    private readonly dbService: EdgeDBService,
    private readonly logger: Logger,
  ) { }

  //region Mailing Lists
  async findAllMailingLists(includeSubscribers = false): Promise<MailingList[]> {
    return await this.dbService.query(e.select(e.notification.MailingList, () => ({
      subscribers: includeSubscribers,
      id: true,
      name: true,
      description: true,
      updated_at: true,
      created_at: true,
    })));
  }

  async findOneMailingList(id: string): Promise<MailingList | null> {
    return await this.dbService.query(e.select(e.notification.MailingList, () => ({ ...e.notification.MailingList['*'], filter_single: { id } })));
  }
  //region SystemNotifications

  //region AuthoredNotifications
}
