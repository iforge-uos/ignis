import e from "@packages/db/edgeql-js";
import { ORPCError } from "@orpc/server";
import { sign_in } from "@packages/db/interfaces";
import { logger } from "@sentry/tanstackstart-react";
import { Executor } from "gel";
import { onUserInsert } from "@/db";
import ldap from "@/ldap";
import { ldapLibraryToUcardNumber } from "./sign-in";

export const PartialUserShape = e.shape(e.users.User, () => ({
  // Fairly minimal, useful for templating
  id: true,
  pronouns: true,
  email: true,
  display_name: true,
  username: true,
  ucard_number: true,
  profile_picture: true,
  created_at: true,
  roles: { id: true, name: true },
}));

export const UserShape = e.shape(e.users.User, () => ({
  // TODO use double splat when it's available edgedb/edgedb-js#558
  ...e.users.User["*"],
  agreements_signed: {
    id: true,
    created_at: true,
    "@created_at": true,
    "@version_signed": true,
    version: true,
  },
  roles: { id: true, name: true },
  mailing_list_subscriptions: true,
}));

export const RepShape = e.shape(e.users.Rep, () => ({
  status: true,
  teams: { id: true, name: true },
}));

export const InfractionShape = e.shape(e.users.Infraction, () => ({
  id: true,
  created_at: true,
  duration: true,
  reason: true,
  type: true,
  resolved: true,
}));

export const AgreementShape = e.shape(e.sign_in.Agreement, () => ({
  ...e.sign_in.Agreement["*"],
  reasons: e.sign_in.Reason["*"],
  _content_hash: false, // no one cares about this implementation detail
}));

export const LocationStatusShape = e.shape(e.sign_in.Location, (location) => ({
  on_shift_rep_count: e.count(location.on_shift_reps),
  off_shift_rep_count: e.count(location.off_shift_reps),
  user_count: e.count(location.sign_ins),
  max_count: true,
  queued_count: e.count(location.queued),
  out_of_hours: true,
  name: true,
  status: true,
  opening_time: true,
  closing_time: true,
  queue_in_use: true,
}));

export const TrainingShape = e.shape(e.training.Training, () => ({
  id: true,
  name: true,
  description: true,
  compulsory: true,
  in_person: true,
  locations: true,
  enabled: true,
  "@created_at": true,
  "@in_person_created_at": true,
  rep: true,
  icon_url: true,
  // "@expires": true,
}));

export const TrainingForLocationShape = e.shape(e.training.Training, () => ({
  id: true,
  name: true,
  description: true,
  compulsory: true,
  locations: true,
  created_at: true,
  updated_at: true,
  in_person: true,
  rep: {
    id: true,
    description: true,
  },
  icon_url: true,
  enabled: true,
  status: e.str("Start"),
}));

export const TrainingSectionShape = e.shape(e.training.Training.sections, () => ({
  id: true,
  index: true,
  content: true,
  ...e.is(e.training.Page, { name: true, duration: true }),
  ...e.is(e.training.Question, {
    type: true,
    answers: {
      id: true,
      content: true,
      correct: true,
    },
  }),
}));

export const QueuePlaceShape = e.shape(e.sign_in.QueuePlace, () => ({
  user: PartialUserShape,
  created_at: true,
  id: true,
  notified_at: true,
  ends_at: true,
  location: {
    name: true,
  },
}));

export const LocationParams = e.params({ name: e.sign_in.LocationName }, ({ name }) =>
  e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } }))),
);

export const TeamShape = e.shape(e.team.Team, () => ({
  name: true,
  description: true,
  id: true,
}));

export const SignInUserShape = e.shape(e.users.User, (user) => ({
  ...UserShape(user),
  infractions: InfractionShape(user.infractions),
}));

export type SignInUser = Omit<NonNullable<Awaited<ReturnType<typeof getSignInUser>>>, "location"> & {
  location?: sign_in.LocationName | null; // type needs broadening from getSignInUser's
  /**
   * Whether the user was just registered
   */
  registered: boolean;
  /**
   * Whether the user has visited the space before
   */
  first_time: boolean;
};

/**
 * Curried conditional for determining the users first_time
 */
const FirstTime = (name: sign_in.LocationName) =>
  e.shape(e.users.User, (user) =>
    e.op(
      "not",
      e.op(
        "exists",
        e.select(user.sign_ins, (sign_in) => ({
          filter: e.op(sign_in.location.name, "=", e.cast(e.sign_in.LocationName, name)),
        })),
      ),
    ),
  );

export const getSignInUser = async ({
  tx,
  ucard_number,
  name,
}: {
  tx: Executor;
  ucard_number: string;
  name: sign_in.LocationName;
}) =>
  e
    .select(e.users.User, (user) => ({
      ...SignInUserShape(user),
      ...e.is(e.users.Rep, {
        status: true,
        teams: { name: true, description: true, id: true },
      }),
      first_time: FirstTime(name)(user),
      registered: e.bool(false as boolean),
      location: e.select(e.sign_in.SignIn, (sign_in) => ({
        filter_single: e.op(e.op(sign_in.user, "=", user), "and", e.op("not", sign_in.signed_out)),
      })).location.name,
      filter_single: { ucard_number: ldapLibraryToUcardNumber(ucard_number) },
    }))
    .run(tx);

/**
 * Get the user from the DB or from LDAP. Always returns and has extra sign in related properties for display on the frontend
 */
export const ensureUser = async ({
  tx,
  ucard_number,
  name,
}: {
  tx: Executor;
  ucard_number: string;
  name: sign_in.LocationName;
}): Promise<SignInUser> => {
  const user = await getSignInUser({ tx, ucard_number, name });
  if (user) return user;
  throw new Error("unreachable");
  logger.info(logger.fmt`Registering user: ${ucard_number} at location: ${name}`);

  // no user registered, fetch from ldap
  const ldap_user = await ldap.lookupByUcardNumber(ucard_number);
  if (!ldap_user) {
    throw new ORPCError("NOT_FOUND", {
      message: `User with UCard Number ${ucard_number} couldn't be found. Perhaps you made a typo? (it should look like 001739897)`,
    });
  }

  const user_by_email = e.select(e.users.User, () => ({
    filter_single: { email: ldap_user.mail },
  }));
  const u = await user_by_email.run(tx);

  const new_user = await e
    .select(
      e.insert(e.sign_in.UserRegistration, {
        location: e.select(e.sign_in.Location, () => ({
          filter_single: { name },
        })),
        // TODO there's a better way incoming but this works for now.
        // check https://discord.com/channels/841451783728529451/1309279819359584397
        // Ideally looks like user: e.insert(e.users.User, ...).unlessConflict(
        // (user) => ({
        //   on: user.email,
        //   else: e.update(user, () => ({
        //     set: ...
        //   })),
        // }),
        // )
        user: u
          ? e.update(e.assert_exists(user_by_email), () => ({
              set: {
                ucard_number: ldapLibraryToUcardNumber(ucard_number),
                username: ldap_user.uid,
                organisational_unit: ldap_user.ou,
              },
            }))
          : e.insert(e.users.User, {
              ...ldap.toInsert(ldap_user),
              identity: e.insert(e.ext.auth.Identity, { issuer: "ignis", subject: "", modified_at: new Date() }),
            }),
      }).user,
      (user) => ({
        ...SignInUserShape(user),
        ...e.is(e.users.Rep, {
          // if rep has gone to PhD they will get a new email so this is necessary
          status: true,
          teams: { name: true, description: true, id: true },
        }),
        signed_in: e.bool(false),
        first_time: FirstTime(name)(user),
        registered: e.bool(!u),
      }),
    )
    .run(tx);

  if (!u) {
    await onUserInsert(new_user);
  }

  return new_user;
};
