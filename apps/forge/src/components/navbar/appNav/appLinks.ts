// appLinks.ts
import { Apps } from "@/types/app.ts";

export type AppLink = {
  app: Apps; // Identifier for the app
  displayName: string; // User-facing name
  path?: string; // Path for the link
  children?: AppLink[]; // Nested links, specific to the same app
  index?: number; // Index of the link in the navbar (PER LEVEL)
  id: string; // Unique identifier for the link
};

export const appLinks: AppLink[] = [
  { app: "Main", displayName: "Home", path: "/", index: 0, id: "home" },
  { app: "Sign In", displayName: "Sign In Home", path: "/signin", index: 0, id: "signin_root" },
  {
    app: "Sign In",
    displayName: "Agreements",
    path: "/signin/agreements",
    index: 1,
    id: "signin_agreements",
  },
  {
    app: "Sign In",
    displayName: "Actions",
    path: "/signin/actions",
    index: 2,
    id: "signin_actions_root",
    children: [
      {
        app: "Sign In",
        displayName: "Sign In",
        path: "/signin/actions/in",
        index: 0,
        id: "signin_actions_in",
      },
      { app: "Sign In", displayName: "Sign Out", path: "/signin/actions/out", id: "signin_actions_out", index: 1 },
      {
        app: "Sign In",
        displayName: "Register",
        path: "/signin/actions/register",
        id: "signin_actions_register",
        index: 2,
      },
      {
        app: "Sign In",
        displayName: "Enqueue",
        path: "/signin/actions/enqueue",
        id: "signin_actions_enqueue",
        index: 3,
      },
    ],
  },
  { app: "Sign In", displayName: "Dashboard", path: "/signin/dashboard", index: 1, id: "signin_status" },
  { app: "Printing", displayName: "Printing", path: "/printing", id: "printing_root", index: 0 },
];
