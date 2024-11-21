import { notification } from "@dbschema/interfaces";
import { std } from "@dbschema/interfaces";

export type Notification = notification.Notification;

export interface MailingList extends Omit<notification.MailingList, "subscribers"> {
  subscribers?: std.BaseObject[];
}
