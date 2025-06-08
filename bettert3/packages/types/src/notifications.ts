import { notification } from "@db/interfaces";
import { std } from "@db/interfaces";

export type Notification = notification.Notification;

export interface MailingList extends Omit<notification.MailingList, "subscribers"> {
  subscribers?: std.BaseObject[];
}
