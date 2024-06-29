import { sign_in, std } from "@dbschema/interfaces";
import * as users from "./users";

export type {
  CreateSignInDto,
  FinaliseSignInDto,
  UpdateSignInDto,
} from "@/sign-in/dto/sigs-in-dto";

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
  status: LocationStatusStatus;
  on_shift_rep_count: number;
  off_shift_rep_count: number;
  user_count: number;
  max: number;
  needs_queue: boolean;
  out_of_hours: boolean;
  count_in_queue: number;
  opening_time: string;
  closing_time: string;
};

/** The type of the location/:location endpoint storing data on who's logged in for the dashboard  */
export type Location = {
  id: string;
  name: LocationName;
  sign_ins: SignInEntry[];
  queued: QueueEntry[];
};

export type LocationStatusStatus = "open" | "soon" | "closed";

//* Training for a user who's requesting to sign in */
export type Training = Omit<users.Training, "locations" | "created_at" | "updated_at"> & {
  selectable?: boolean;
};

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
