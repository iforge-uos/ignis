import { RoleSelector } from "@/components/command-menu/actions/role-selector";
import { CommandAction } from "@/types/commands";
import {
  DramaIcon,
  LayoutDashboard,
  LogIn,
  LogOut,
  LucideIcon,
  Settings,
  UserRound,
  UserRoundSearch,
} from "lucide-react";

export interface CommandConfig {
  shortcutKey: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  requiredRoles?: string[];
  group: "Settings" | "Admin" | "Actions" | "Sign In";
  action: CommandAction;
}

export const commandConfig: CommandConfig[] = [
  {
    shortcutKey: "p",
    label: "Profile",
    icon: UserRound,
    group: "Settings",
    requiredRoles: [],
    action: {
      type: "navigate",
      to: "/user/me",
    },
  },
  {
    shortcutKey: ",",
    label: "Settings",
    icon: Settings,
    group: "Settings",
    disabled: true,
    requiredRoles: [],
    action: {
      type: "navigate",
      to: "/user/settings",
    },
  },
  {
    shortcutKey: "d",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Sign In",
    requiredRoles: ["rep"],
    action: {
      type: "navigate",
      to: "/sign-in/dashboard",
    },
  },
  {
    shortcutKey: "u",
    label: "Search users",
    icon: UserRoundSearch,
    disabled: true,
    group: "Admin",
    requiredRoles: ["admin"],
    action: {
      type: "navigate",
      to: "/users",
    },
  },
  {
    shortcutKey: "i",
    label: "Sign in",
    icon: LogIn,
    group: "Sign In",
    requiredRoles: ["rep"],
    action: {
      type: "navigate",
      to: "/sign-in/actions/in",
    },
  },
  {
    shortcutKey: "o",
    label: "Sign out",
    icon: LogOut,
    group: "Sign In",
    requiredRoles: ["rep"],
    action: {
      type: "navigate",
      to: "/sign-in/actions/out",
    },
  },
  {
    shortcutKey: "y",
    label: "Change Roles",
    icon: DramaIcon,
    group: "Actions",
    requiredRoles: ["rep"],
    action: {
      type: "component",
      component: <RoleSelector />,
    },
  },
];
