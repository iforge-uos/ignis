import { pub } from "@/router";
import { agreementsRouter } from "./agreements";
import { locationsRouter } from "./locations";
import { notificationsRouter } from "./notifications";
import { signInsRouter } from "./sign-ins";
import { teamsRouter } from "./teams";
import { trainingRouter } from "./training";
import { usersRouter } from "./users";

export const router = pub.router({
  agreements: agreementsRouter,
  locations: locationsRouter,
  notifications: notificationsRouter,
  signIns: signInsRouter,
  teams: teamsRouter,
  training: trainingRouter,
  users: usersRouter,
});

// Export type router type signature,
// NOT the router itself.
export type Router = typeof router;
