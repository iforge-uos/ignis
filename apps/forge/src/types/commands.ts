// Define possible action types
import { RoutePath } from "@/types/router";
import { ReactNode } from "react";


export type CommandNavigateParams =
  | Record<string, string>
  | (() => Record<string, string> | undefined);

export type NavigateAction = {
  type: "navigate";
  to: RoutePath;
  params?: CommandNavigateParams; // TODO should be typed based on the RoutePath
};

export type ComponentAction = {
  type: "component";
  component: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
};

export type CustomAction = {
  type: "custom";
  handler: () => void;
};

export type CommandAction = NavigateAction | ComponentAction | CustomAction;
