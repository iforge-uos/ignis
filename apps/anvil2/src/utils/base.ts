import { TRPCError } from "@trpc/server";
import { CardinalityViolationError } from "gel";

/**
 * Function to sleep and block the execution thread for a given time.
 *
 * @param ms - The amount of milliseconds to sleep for
 * @returns A promise that resolves after the given time
 *
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function checkNotFoundError(error: unknown, name: string, id: string) {
  if (error instanceof CardinalityViolationError) {
    throw new TRPCError({
      message: `${name} with id ${id} not found`,
      cause: error,
      code: "NOT_FOUND",
    });
  }
}
