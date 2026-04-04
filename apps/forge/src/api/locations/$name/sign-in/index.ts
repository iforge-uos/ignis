import { rep } from "@/orpc";
import { flow, initialise, receive } from "./$ucard";

export const signInRouter = rep.prefix("/sign-in").router({
  flow,
  initialise,
  receive,
});
