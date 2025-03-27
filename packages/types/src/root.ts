import { sign_in } from "@dbschema/interfaces";
import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";
import { PartialReason } from "./sign_in";
import { PartialUser } from "./users";

export type Agreement = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  content: string;
  version: number;
  reasons: { name: string }[];
};

export type SignIn = {
  user: PartialUser;
  reason: PartialReason;
  id: string;
  created_at: Date;
  ends_at: Date | null;
  duration: Temporal.Duration | Duration; // number of seconds
  location: { name: sign_in.LocationName };
  signed_out: boolean | null;
  tools: string[];
};
