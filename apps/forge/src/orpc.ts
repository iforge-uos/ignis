import { ErrorMap, os } from "@orpc/server";
import e from "@packages/db/edgeql-js";
import { team } from "@packages/db/interfaces";
import { Client, Executor } from "gel";
import z from "zod";
import dbClient from "@/db";
import { RepShape, UserShape } from "@/lib/utils/queries";
import { InitialContext } from "@/routes/api/$";
import sentryMiddleware from "@/lib/sentry/server"

export type Context = Awaited<ReturnType<typeof createContext>>;

export const createContext = async ({ session: { client } }: InitialContext) => {
  const db = client ?? dbClient;
  return {
    user: await e
      .select(e.global.user, (u) => ({
        ...UserShape(u),
        ...e.is(e.users.Rep, RepShape(u)),
      }))
      .run(db),
    db: db as Executor,
  };
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
  })
  .use(async ({ next, context: { user, ...props }, errors }) => {
    if (!user) {
      throw errors.UNAUTHORIZED();
    }
    return next({
      context: { user, $user: e.assert_exists(e.global.user), ...props } as AuthContext,
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
