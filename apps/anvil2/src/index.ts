import { z } from "zod";
import { router, t } from "./trpc";
import { signInRouter } from "@/routes/location/:location/index";

const appRouter = router({
  "sign-in": signInRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
