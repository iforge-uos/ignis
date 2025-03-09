import { pub } from "@/router";
import { agreementsRouter } from "./agreements";
import { locationsRouter } from "./locations";
import { notificationsRouter } from "./notifications";
import { signInsRouter } from "./sign-ins";
import { teamsRouter } from "./teams";
import { trainingRouter } from "./training";

const appRouter = pub.router({
  agreements: agreementsRouter,
  locations: locationsRouter,
  notifications: notificationsRouter,
  signIns: signInsRouter,
  teams: teamsRouter,
  training: trainingRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
