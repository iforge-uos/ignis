import { notification } from "@packages/db/interfaces";
import z from "zod";

export const UNSELECTABLE_TYPES = new Set(["INFRACTION", "PRINTING", "QUEUE_SLOT_ACTIVE", "TRAINING", "REFERRAL"] as notification.Type[]);

export const Target = z.literal([
  "notification::AllUsers",
  "notification::AllReps",
  "users::User",
  "users::Rep",
  "team::Team",
  "notification::MailingList",
  "event::Event",
  "default::user", // I don't think you ever actually get this but it makes the types work
]);

export function priorityToName(priority: number) {
  switch (priority) {
    case 1:
      return "Low";
    case 2:
      return "Normal";
    case 3:
      return "High";
    default:
      return `It's a ${priority} not that I hope you ever see this`
  }
}
