import type { CalendarDatum } from "@nivo/calendar";
import { helper, notification, std, users } from "@packages/db/interfaces";
import { training } from ".";
import { LocationName } from "./sign_in";

//** A user useful for templating where resolving isn't entirely necessary */
export type PartialUser = {
  id: string;
  display_name: string;
  pronouns?: string | null;
  email: string;
  username: string;
  ucard_number: number;
  created_at: Temporal.ZonedDateTime;
  profile_picture?: string | null;
  roles: users.Role[];
};

export type ShortTeam = {
  id: string;
  name: string;
};

export type ShortTeamWithDesc = ShortTeam & { description: string };

export type PartialUserWithTeams = PartialUser & {
  teams?: ShortTeam[] | null;
};

//** A fairly full user with everything resolved from the database. */
export type User = helper.Props<users.User> &
  Omit<
    Record<NonNullable<helper.linkKeys<users.User>>, std.BaseObject[]>,
    | "infractions"
    | "roles"
    | "agreements_signed"
    | "training"
    | "mailing_list_subscriptions"
    | "notifications"
    | "identity"
  > & {
    roles: users.Role[];
    agreements_signed: {
      id: string;
      "@created_at": Temporal.ZonedDateTime | null;
      "@version_signed": number | null;
      version: number;
    }[];
    profile_picture?: string | null;
    notifications: (notification.Notification & {
      "@acknowledged_at": Temporal.ZonedDateTime | null
    })[]
  };

export type Infraction = Omit<users.Infraction, "user">;
export type UserWithInfractions = User & {
  infractions: Infraction[];
};
export type InfractionType = users.InfractionType;

//** A user's trainings. /users/:id/training */
export type Training = Omit<training.PartialTraining, "created_at" | "updated_at"> & {
  expired?: boolean; // this should be "@expired", though currently a compute
  "@created_at"?: Temporal.ZonedDateTime | null;
  "@in_person_created_at"?: Temporal.ZonedDateTime | null;
};

export type SignInStat = CalendarDatum & {
  day: string;
  value: number;
  sign_ins: {
    id: string;
    created_at: Temporal.ZonedDateTime;
    duration: number | null;
    ends_at: Temporal.ZonedDateTime | null;
    location: { name: LocationName };
  }[];
};

export type RepStatus = users.RepStatus;

export type Rep = User & {
  status: RepStatus;
  teams: { id: string; name: string }[];
};
