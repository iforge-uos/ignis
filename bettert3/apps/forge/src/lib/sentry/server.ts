import { ORPCError, os } from "@orpc/server";
import * as Sentry from "@sentry/core";
import { InvalidArgumentError, CardinalityViolationError, AccessError } from "gel";

type Options = {
  captureInputs?: boolean;
};

export default (options: Options = {}) =>
  os.middleware(async ({ next, path }, input) => {
    return await Sentry.startSpan(
      {
        name: `orpc.${path.join("/")}`,
        attributes: {
          "rpc.system": "orpc",
          "rpc.method": path.join("."),
          ...(options.captureInputs && {
            "rpc.arguments": input ? JSON.stringify(input) : undefined,
          }),
        },
      },
      async (span) => {
        try {
          return await next();
        } catch (error) {
          // Some errors can be suppressed so just re-throw
          if (error instanceof InvalidArgumentError) {
            throw new ORPCError("NOT_FOUND", {
              message: `${path} with id ${path[-1]} not found`,
              cause: error,
            });
          }
          if (error instanceof CardinalityViolationError) {
            throw new ORPCError("NOT_FOUND", {
              message: `${path} with id ${path[-1]} not found`,
              cause: error,
            });
          }
          if (error instanceof AccessError) {
            // biome-ignore lint/suspicious/noCatchAssign: umm no it isn't
            error = new ORPCError("FORBIDDEN", {
              message: error.message,
              cause: error,
            });
          }
          span.setStatus({
            code: 2,
          });
          Sentry.captureException(error);

          // Re-throw the error so it can be handled by the error handler
          throw error;
        }
      },
    );
  });
