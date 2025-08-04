import sentryMiddleware from "@/lib/sentry/server";
import { os, ErrorMap } from "@orpc/server";
import e, { $infer } from "@packages/db/edgeql-js";
import { Client } from "gel";
import * as z from "zod";
import client from "@/db";
import env from "@/lib/env";
import { UserShape } from "@/lib/utils/queries";
import { Executor } from "gel";
import type {InitialContext} from "@/routes/api.$"


export type Context = Awaited<ReturnType<typeof createContext>>;

export const createContext = async ({ request }: InitialContext) => {
  const db = client;
  // const db = req.session?.client ?? client;
  return {
    user: await e.select(e.users.User, (u) => ({ ...UserShape(u), filter_single: { username: "eik21jh" } })).run(db),
    // session: req.session,
    db: db.withGlobals({ ...env.db.globals }) as Executor,
    // req,
    // res,
  };
};

const _user = e.assert_exists(e.global.user);

export interface AuthContext extends Context {
  user: $infer<typeof UserShape>[number];
  $user: typeof _user;
}

export const pub = os
  .$context<InitialContext>()
  .$route({ method: "GET" })
  .use(sentryMiddleware({ captureInputs: true }))
  .use(async ({ next, context: { request, ...props } }) => {
    return next({
      context: {request, ...(await createContext({ request }))},
    });
  });

export const auth = pub
  .errors({
    UNAUTHORIZED: {
      message: "You are not logged in",
    },
  })
  .use(async ({ next, context: { user, ...props }, errors }) => {
    // if (!user) {
    //   throw errors.UNAUTHORIZED();
    // }
    return next({
      context: { user, $user: e.assert_exists(e.global.user), ...props } as AuthContext,
    });
  });

const RoleGatedError = z.object({ current: z.array(z.object({ id: z.uuid(), name: z.string() })) });
const ROLE_GATED_ERRORS = {
  ROLE_GATED: {
    message: "You are not able to use this method based on your roles",
    status: 401,
    data: RoleGatedError.extend({ required: z.object({ name: z.string() }) }),
  },
  OR_ROLE_GATED: {
    message: "You are not able to use this method based on your roles",
    status: 401,
    data: RoleGatedError.extend({ required: z.array(z.object({ name: z.string() })) }),
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
