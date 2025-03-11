import { os } from "@orpc/server";
import { Context } from ".";

// Define context type for full type inference
export const pub = os.$context<Context>().$route({
  inputStructure: "detailed",
  outputStructure: "detailed",
});

export const auth = pub
  .errors({
    UNAUTHORIZED: {
      message: "You are not logged in",
    },
    ROLE_GATED: { message: "You are not able to use this method based on your roles", status: 401 },
  })
  .use(async ({ next, context: { user, ...props }, errors }) => {
    if (!user) {
      throw errors.UNAUTHORIZED;
    }
    return next({
      context: { user, ...props },
    });
  });

const roleGated = (name: string): Parameters<typeof auth.use>[0] => {
  return async ({ next, context: { user, ...props }, errors }) => {
    if (!user.roles.some((r) => r.name === name)) {
      throw errors.ROLE_GATED;
    }
    return next({
      context: { user, ...props },
    });
  };
};

export const desk = auth.use(roleGated("Desk"));
export const rep = auth.use(roleGated("Rep"));
export const admin = auth.use(roleGated("Admin"));

const orRoleGated = (...names: string[]): Parameters<typeof auth.use>[0] => {
  return async ({ next, context: { user, ...props }, errors }) => {
    if (!user.roles.some((r) => names.includes(r.name))) {
      throw errors.ROLE_GATED;
    }
    return next({
      context: { user, ...props },
    });
  };
};

export const deskOrAdmin = auth.use(orRoleGated("Desk", "Admin"));

// export const signInProcedure = deskOrAdminProcedure.use(async ({ next, ctx, getRawInput }) => {
//   await next();
// });

export const transaction = pub.middleware(async ({ context, next }) =>
  context.db.transaction(async (tx) => next({ context: { tx, ...context } })),
);
