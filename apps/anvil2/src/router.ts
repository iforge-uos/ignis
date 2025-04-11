import { os, ErrorMap, MiddlewareOutputFn } from "@orpc/server";
import { z } from "zod";
import { Context } from ".";

export const pub = os.$context<Context>();

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
      context: { user, ...props },
    });
  });

const RoleGatedError = z.object({ current: z.array(z.object({ id: z.string().uuid(), name: z.string() })) });
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
} satisfies ErrorMap;

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
  constructor(data: any) {
    super("Rolled back transaction");
    this.data = data;
  }
}

/**
 * Middleware to wrap a route in a transaction.
 * Using the return value of a rolled back function is UB.
 */
export const transaction = pub.middleware(async ({ context, next }, _, _output: MiddlewareOutputFn<void>) =>
  context.db.transaction(async (tx) => {
    try {
      return await next({ context: { tx, ...context } });
    } catch (err) {
      if (err instanceof RollbackTransaction) {
        throw err;
      }
      return undefined as any;
    }
  }),
);
