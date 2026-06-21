import { Temporal } from "@js-temporal/polyfill";
import { sign_in } from "@packages/db/interfaces";

export interface EmailPrintUploadDetails {
  created_at: Date;
  print_name: string;
  position: number;
  lead_time: Temporal.Duration;
}

export interface EmailPrintSendDetails {
  sent_at: Date;
  print_name: string;
  print_time: Temporal.Duration;
  printer: string;
  location: sign_in.LocationName;
}

export interface EmailPrintFinishDetails {
  finished_at: Date;
  print_name: string;
  success: boolean;
  requeue: boolean;
  reason: string;
  attempt: number;
  location: sign_in.LocationName;
}
