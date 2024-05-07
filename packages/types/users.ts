import { auth, helper, std, users } from "@dbschema/interfaces";
import { Location } from "./sign_in";
export type { CreateUserDto, UpdateUserDto } from "@/users/dto/users.dto";
import type { CalendarDatum } from "@nivo/calendar";
import { training } from "./";

//** A user useful for templating where resolving isn't entirely necessary */
export type PartialUser = {
  id: string;
  display_name: string;
  pronouns?: string | null;
  email: string;
  username: string;
  ucard_number: number;
  created_at: Date;
  profile_picture?: string | null;
  roles: Omit<auth.Role, "permissions">[];
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
    "infractions" | "roles" | "agreements_signed" | "training"
  > & {
    roles: Omit<auth.Role, "permissions">[];
    agreements_signed: {
      id: string;
      "@created_at": Date | null;
      version: number;
    }[];
    profile_picture?: string | null;
  };

export type Infraction = Omit<users.Infraction, "user">
export type UserWithInfractions = User & {
  infractions: Infraction;
};
export type InfractionType = users.InfractionType;

export type UserInPersonTrainingRemaining = { name: string; id: string; locations: training.Location[] };
//** A user's trainings. /users/:id/training */
export type Training = Omit<training.PartialTraining, "created_at" | "updated_at"> & {
  expired?: boolean; // this should be "@expired", though currently a compute
  "@created_at"?: Date | null;
  "@in_person_created_at"?: Date | null;
};

export type SignInStat = CalendarDatum & {
  day: string;
  value: number;
  sign_ins: {
    id: string;
    created_at: Date;
    duration: number | null;
    ends_at: Date | null;
    location: Location;
  }[];
};

export type RepStatus = users.RepStatus;

export type Rep = User & {
  status: RepStatus;
  teams: { id: string; name: string }[];
};
