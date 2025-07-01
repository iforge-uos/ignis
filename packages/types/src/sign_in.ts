import { sign_in, std, training } from "@db/interfaces";
import type { GetSignInTrainingsReturns } from "@db/queries/getSignInTrainings.query";
import { Temporal } from "@js-temporal/polyfill";
import { LocalTime } from "gel";
import * as users from "./users";

/** All the locations amiable to login to */
export type LocationName = sign_in.LocationName;
export type ReasonCategory = sign_in.ReasonCategory;
export type PartialReason = {
  id: string;
  name: string;
  category: ReasonCategory;
};
export type SignInEntry = {
  id: string;
  user: users.PartialUserWithTeams;
  reason: PartialReason;
  tools: string[];
  ends_at: Date | null;
  created_at: Date;
};
export type QueueEntry = {
  id: string;
  user: users.PartialUser;
  notified_at: Date | null;
  created_at: Date;
  ends_at: Date | null;
};

export type PartialLocation = {
  status: LocationStatus;
  on_shift_rep_count: number;
  off_shift_rep_count: number;
  user_count: number;
  max_count: number;
  queue_in_use: boolean;
  out_of_hours: boolean;
  queued_count: number;
  opening_time: LocalTime | Temporal.PlainTime;
  closing_time: LocalTime | Temporal.PlainTime;
};

/** The type of the location/:location endpoint storing data on who's logged in for the dashboard  */
export type Location = {
  id: string;
  name: LocationName;
  sign_ins: SignInEntry[];
  queued: QueueEntry[];
};

export type LocationStatus = sign_in.LocationStatus;

//* Training for a user who's requesting to sign in */
export type Training = GetSignInTrainingsReturns["training"][number];

export type User = users.UserWithInfractions & {
  training: Training[];
  registered: boolean;
  is_rep: boolean;
  signed_in: boolean;
  teams?: users.ShortTeam[];
};

export type Reason = PartialReason & {
  created_at: Date;
  agreement?: std.BaseObject;
};

export type TrainingSelectability = Training["selectable"][number];

export type SupervisingRep = {
  id: string;
  supervisable_training: {
    id: string;
  }[];
  display_name: string;
}[];
