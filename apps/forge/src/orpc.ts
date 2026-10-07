import { ErrorMap, os } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { team } from "@packages/db/interfaces";
import { Client, Executor } from "gel";
import z from "zod";
import dbClient from "@/db";
import sentryMiddleware from "@/lib/sentry/server";
import { isInvalidAuthToken } from "@/lib/utils/auth";
import { RepShape, UserShape } from "@/lib/utils/queries";
import { InitialContext } from "@/routes/api/$";

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Rotating the auth signing secret invalidates every cookie out there at once, so without this the
 * warning would be one stack trace per request from every logged-in client until they all gave up.
 * Say it once a minute instead, with the damage report.
 */
const REJECTED_TOKEN_LOG_INTERVAL = 60_000;
let rejectedTokens = 0;
let rejectedTokensLoggedAt = 0;

function noteRejectedAuthToken(error: unknown) {
  rejectedTokens++;
  const now = Date.now();
  if (now - rejectedTokensLoggedAt < REJECTED_TOKEN_LOG_INTERVAL) return;
  rejectedTokensLoggedAt = now;
  console.warn(
    `Rejected ${rejectedTokens} auth token(s) we can't verify (${(error as Error).message}). If the signing secret was just rotated this is expected — those clients are being asked to sign in again.`,
  );
  rejectedTokens = 0;
}

export const createContext = async ({ session: { client } }: InitialContext) => {
  const db = client ?? dbClient;
  try {
    return {
      user: await e
        .select(e.global.user, (u) => ({
          ...UserShape(u),
          ...e.is(e.users.Rep, RepShape(u)),
        }))
        .run(db),
      db: db as Executor,
      authTokenRejected: false,
    };
  } catch (error) {
    if (!isInvalidAuthToken(error)) throw error;
    noteRejectedAuthToken(error);
    // Nothing on this request can be authenticated, and every query carrying the token would fail
    // the same way, so drop it and carry on anonymously: public procedures keep working, and `auth`
    // turns the rejection into a 401 telling the client to sign in again rather than a 500.
    return { user: null, db: dbClient as Executor, authTokenRejected: true };
  }
};

const _user = e.assert_exists(e.global.user);

export interface AuthContext extends Context {
  user: NonNullable<Context["user"]>;
  $user: typeof _user;
}

export const pub = os
  .$context<InitialContext>()
  .$route({ method: "GET" })
  .errors({
    INPUT_VALIDATION_FAILED: {},
    NOT_FOUND: {},
    FORBIDDEN: {},
  })
  .use(sentryMiddleware({ captureInputs: true }))
  .use(async ({ next, context }) => {
    return next({
      context: await createContext(context),
    });
  });

export const auth = pub
  .errors({
    UNAUTHORIZED: {
      message: "You are not logged in",
    },
    SESSION_EXPIRED: {
      status: 401,
      message: "Your session is no longer valid. Please sign in again.",
    },
  })
  .use(async ({ next, context: { user, authTokenRejected, ...props }, errors }) => {
    if (!user) {
      // Distinct from UNAUTHORIZED so the client knows to bin the dead cookie rather than just
      // bounce to the login page with it still set.
      throw authTokenRejected ? errors.SESSION_EXPIRED() : errors.UNAUTHORIZED();
    }
    return next({
      context: { user, $user: e.assert_exists(e.global.user), authTokenRejected, ...props } as AuthContext,
    });
  });

const GatedError = z.object({ current: z.array(z.object({ id: z.uuid(), name: z.string() })) });
const ROLE_GATED_ERRORS = {
  ROLE_GATED: {
    message: "You are not able to use this method based on your roles",
    status: 403,
    data: GatedError.extend({ required: z.object({ name: z.string() }) }),
  },
  OR_ROLE_GATED: {
    message: "You are not able to use this method based on your roles",
    status: 403,
    data: GatedError.extend({ required: z.array(z.object({ name: z.string() })) }),
  },
  NOT_A_REP: {
    message: "You are not able to use this method as you aren't a rep. Maybe you should apply :)",
    status: 403,
  },
  TEAM_GATED: {
    message: "You are not able to use this method based on your team",
    status: 403,
    data: GatedError.extend({ required: z.array(z.object({ name: z.string() })) }),
  },
} as const satisfies ErrorMap;

const roleGated = (name: string) => {
  return os
    .$context<{ user: NonNullable<Context["user"]> }>()
    .errors(ROLE_GATED_ERRORS)
    .middleware(async ({ context, next, errors }) => {
      const { user } = context;
      if (!user.roles.some((r) => r.name === name)) {
        throw errors.ROLE_GATED({ data: { current: user.roles, required: { name } } });
      }

      return next({ context });
    });
};

export const desk = auth.use(roleGated("Desk"));
export const rep = auth.use(roleGated("Rep"));
export const admin = auth.use(roleGated("Admin"));

const orRoleGated = (...names: string[]) => {
  return os
    .$context<{ user: NonNullable<Context["user"]> }>()
    .errors(ROLE_GATED_ERRORS)
    .middleware(async ({ context, next, errors }) => {
      const { user } = context;
      if (!user.roles.some((r) => names.includes(r.name))) {
        throw errors.OR_ROLE_GATED({ data: { current: user.roles, required: names.map((name) => ({ name })) } });
      }

      return next({ context });
    });
};

export const deskOrAdmin = auth.use(orRoleGated("Desk", "Admin"));

const teamGated = (...names: team.Name[]) => {
  return os
    .$context<{ user: NonNullable<Context["user"]> }>()
    .errors(ROLE_GATED_ERRORS)
    .middleware(async ({ context, next, errors }) => {
      const { user } = context;
      if (user.__typename !== "users::Rep") {
        throw errors.NOT_A_REP();
      }
      if (!user.teams.some((t) => names.includes(t.name as team.Name))) {
        throw errors.OR_ROLE_GATED({ data: { current: user.teams, required: names.map((name) => ({ name })) } });
      }

      return next({ context });
    });
};

export const events = auth.use(teamGated("Events"));
export const eventsOrDeskOrAdmin = auth.use(teamGated("Events"));

export class RollbackTransaction extends Error {
  readonly data: any;
  constructor(data?: any) {
    super("Rolled back transaction");
    this.data = data;
  }
}

/**
 * Middleware to wrap a route in a transaction.
 */
export const transaction = os
  .$context<{ user: NonNullable<Context["user"]>; db: Context["db"] }>()
  .middleware(async ({ context, next }) =>
    (context.db as Client).transaction(async (tx) => next({ context: { tx, ...context } })),
  );
