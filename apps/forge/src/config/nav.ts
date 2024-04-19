import { Apps } from "@/types/app.ts";

interface AppNavMapping {
  [routeSegment: string]: Apps;
}

export const appNavMapping: AppNavMapping = {
  auth: "Auth",
  training: "Training",
  "": "Main",
  users: "User",
  printing: "Printing",
  signin: "Sign In",
  admin: "Admin",
};
