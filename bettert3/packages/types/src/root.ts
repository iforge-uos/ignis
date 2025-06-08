import { sign_in } from "@db/interfaces";
import { Temporal } from "@js-temporal/polyfill";
import { PartialReason } from "./sign_in";
import { PartialUser } from "./users";

export type Agreement = {
  id: string;
  name: string;
  created_at: Temporal.ZonedDateTime;
  updated_at: Temporal.ZonedDateTime;
  content: string;
  version: number;
  reasons: { name: string }[];
};

export type SignIn = {
  user: PartialUser;
  reason: PartialReason;
  id: string;
  created_at: Temporal.ZonedDateTime;
  ends_at: Temporal.ZonedDateTime | null;
  duration: Temporal.Duration; // number of seconds
  location: { name: sign_in.LocationName };
  signed_out: boolean | null;
  tools: string[];
};
