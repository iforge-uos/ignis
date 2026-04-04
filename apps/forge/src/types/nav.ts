import { LucideIcon } from "lucide-react";
import { Apps } from "@/types/app";
import { RoutePath } from "@/types/router";

export type NavRouteParams =
  | Record<string, string>
  | (() => Record<string, string> | undefined);

export interface AppConfig {
  name: Apps;
  url: RoutePath;
  params?: NavRouteParams;
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
  url?: RoutePath;
  params?: NavRouteParams;
  icon?: Omit<LucideIcon, "$$typeof">;  // our own icons don't have this
  isActive?: boolean;
  requiredRoles?: string[];
  items?: Route[];
  disabled?: boolean;
}

export interface NavSub {
  name: string;
  url: RoutePath | string;
  params?: NavRouteParams;
  icon: LucideIcon;
  isExternal?: boolean;
  disabled?: boolean;
}
