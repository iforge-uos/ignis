import { rep } from "@/orpc";
import { flow, initialise, receive } from "./$ucard";
import { user } from "./user";

export const signInRouter = rep.prefix("/sign-in").router({
  flow,
  initialise,
  receive,
  user,
});
