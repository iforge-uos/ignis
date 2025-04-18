import { pub } from "@/router";
import { agreementsRouter } from "./agreements";
import { authRouter } from "./auth";
import { deployRouter } from "./deploy";
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
  deploy: deployRouter,
});

export type Router = typeof router;
