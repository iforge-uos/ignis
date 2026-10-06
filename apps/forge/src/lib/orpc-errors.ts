import { ORPCError } from "@orpc/server";

/**
 * Root error interceptor for both transports.
 *
 * A 401 is the API working as designed — the caller has no usable session — so a stack trace per
 * occurrence only buries the 5xxs someone actually needs to see. That matters most right after the
 * auth signing secret is rotated: every logged-in client discovers its cookie is dead at once, and
 * each of them has several requests in flight. Sentry still hears about anything unexpected via
 * `sentryMiddleware`.
 */
export function logUnexpectedError(error: unknown) {
  if (error instanceof ORPCError && error.status === 401) return;
  console.error(error);
}
