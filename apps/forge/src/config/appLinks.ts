// appLinks.ts
import { Apps } from "@/types/app.ts";
import { appRoutes } from "@/types/common";

export type AppLink = {
  app: Apps; // Identifier for the app
  displayName: string; // User-facing name
  path?: appRoutes; // Path for the link
  children?: AppLink[]; // Nested links, specific to the same app
  index?: number; // Index of the link in the navbar (PER LEVEL)
  id: string; // Unique identifier for the link
};

export const appLinks: AppLink[] = [
  { app: "Home", displayName: "Home", path: "/", index: 0, id: "home" },
  { app: "Sign In", displayName: "Home", path: "/signin", index: 0, id: "signin_root" },
  {
    app: "Sign In",
    displayName: "Agreements",
    path: "/signin/agreements",
    index: 1,
    id: "sign_in_agreements",
  },
  {
    app: "Sign In",
    displayName: "Actions",
    index: 2,
    id: "sign_in_actions_root",
    children: [
      {
        app: "Sign In",
        displayName: "Sign In",
        path: "/signin/actions/in",
        index: 0,
        id: "sign_in_actions_in",
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
  { app: "Sign In", displayName: "Dashboard", path: "/signin/dashboard", index: 3, id: "signin_dashboard" },
  { app: "Training", displayName: "Home", path: "/training", index: 0, id: "training_home" },
  {
    app: "Training",
    displayName: "Locations",
    path: "/training",
    index: 1,
    id: "training_locations_root",
    children: [
      {
        app: "Training",
        displayName: "Mainspace",
        path: "/training/locations/mainspace",
        index: 0,
        id: "training_locations_mainspace",
      },
      {
        app: "Training",
        displayName: "Heartspace",
        path: "/training/locations/heartspace",
        id: "training_location_heartspace",
        index: 1,
      },
      {
        app: "Training",
        displayName: "George Porter",
        path: "/training/locations/george-porter",
        id: "training_location_george_porter",
        index: 2,
      },
    ],
  },
  {
    app: "Training",
    displayName: "Useful Links",
    path: "/training",
    index: 2,
    id: "training_useful_links_root",
    children: [
      {
        app: "Training",
        displayName: "Approved Materials",
        path: "/training/approved-materials",
        index: 0,
        id: "training_useful_links_approved_materials",
      },
      {
        app: "Training",
        displayName: "Risk Assessments",
        path: "/training/risk-assessments",
        id: "training_useful_links_risk_assessments",
        index: 1,
      },
    ],
  },
  { app: "Printing", displayName: "Printing", path: "/printing", id: "printing_root", index: 0 },
  { app: "Auth", displayName: "Login", path: "/auth/login", id: "auth_login", index: 0 },
  { app: "Auth", displayName: "Logout", path: "/auth/logout", id: "auth_logout", index: 1 },
  { app: "Admin", displayName: "Dashboard", path: "/admin/dashboard", id: "admin_dashboard", index: 0 },
  { app: "Admin", displayName: "Agreements", path: "/admin/agreements", id: "admin_agreements", index: 1 },
  {
    app: "Admin",
    displayName: "Notifications",
    index: 2,
    id: "admin_notifications_link_root",
    children: [
      {
        app: "Admin",
        displayName: "Dashboard",
        path: "/admin/notifications/dashboard",
        index: 0,
        id: "admin_notifications_links_dashboard",
      },
      {
        app: "Admin",
        displayName: "Email",
        path: "/admin/notifications/email",
        index: 1,
        id: "admin_notifications_links_email",
      },
      {
        app: "Admin",
        displayName: "App",
        path: "/admin/notifications/app",
        index: 2,
        id: "admin_notifications_links_app",
      },
      {
        app: "Admin",
        displayName: "Discord",
        path: "/admin/notifications/discord",
        index: 3,
        id: "admin_notifications_links_discord",
      },
    ],
  },
  { app: "Admin", displayName: "Reps", path: "/admin/reps", id: "admin_reps", index: 2 },
  { app: "Admin", displayName: "Teams", path: "/admin/teams", id: "admin_teams", index: 3 },
  { app: "Admin", displayName: "Training", path: "/admin/training", id: "admin_training", index: 4 },
  { app: "Admin", displayName: "Users", path: "/admin/users", id: "admin_users", index: 5 },
];
