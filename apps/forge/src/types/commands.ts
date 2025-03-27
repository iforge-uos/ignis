// Define possible action types
import { RoutePath } from "@/types/router";
import { ReactNode } from "react";

export type NavigateAction = {
  type: "navigate";
  to: RoutePath;
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
