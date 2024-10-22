import { Apps } from "@/types/app.ts";
import { LucideIcon } from "lucide-react";
import { RoutePath } from "@/types/router";

export interface Route {
  title: string;
  url: RoutePath;
  icon?: LucideIcon;
  isActive?: boolean;
  requiredRoles?: string[];
  items?: Route[];
}

export interface AppConfig {
  name: Apps;
  url: RoutePath;
  logo: LucideIcon;
  description: string;
  mainMenuNavigable: boolean;
  requiredRoles?: string[];
  routes: Route[];
  navSub?: NavSub[];
}

export interface NavSub {
  name: string;
  url: string;
  icon: LucideIcon;
}
