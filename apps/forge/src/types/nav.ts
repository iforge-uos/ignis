import { Apps } from "@/types/app.ts";
import { LucideIcon } from "lucide-react";
import { RoutePath } from "@/types/router";

export interface AppConfig {
  name: Apps;
  url: RoutePath;
  logo: LucideIcon;
  description: string;
  mainMenuNavigable: boolean;
  requiredRoles?: string[];
  routes: Route[];
  navSub?: NavSub[];
  color: string;
}
export interface Route {
  title: string;
  url: RoutePath;
  icon?: LucideIcon;
  isActive?: boolean;
  requiredRoles?: string[];
  items?: Route[];
}

export interface NavSub {
  name: string;
  url: string | RoutePath;
  icon: LucideIcon;
  isExternal?: boolean;
}
