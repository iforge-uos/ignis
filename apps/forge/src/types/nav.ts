import { LucideIcon } from "lucide-react";
import { Apps } from "@/types/app";
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
  icon?: Omit<LucideIcon, "$$typeof">;  // our own icons don't have this
  isActive?: boolean;
  requiredRoles?: string[];
  items?: Route[];
}

export interface NavSub {
  name: string;
  url: RoutePath;
  icon: LucideIcon;
  isExternal?: boolean;
}
