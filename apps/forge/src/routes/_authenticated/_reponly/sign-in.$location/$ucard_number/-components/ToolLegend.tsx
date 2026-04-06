import type { tools } from "@packages/db/interfaces";
import type { GetSignInToolsReturns } from "@packages/db/queries/getSignInTools.query";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import {
  Ban,
  CheckIcon,
  Clock,
  GitMerge,
  HelpCircle,
  MapPin,
  Monitor,
  UserCheck,
  Users,
  UserX,
  Video,
  Wrench,
} from "lucide-react";
import React from "react";
import { NoRepIcon } from "@/icons/NoRep";
import { cn } from "@/lib/utils/cn";

export interface ToolCardInfo {
  name: tools.Selectability | "SELECTABLE" | "UNREACHABLE";
  icon: React.ElementType;
  colour: string;
  label: string;
  tooltip: string;
}

type Tool = GetSignInToolsReturns[number];

const SELECTABLE: ToolCardInfo = {
  name: "SELECTABLE",
  icon: CheckIcon,
  colour: cn("bg-emerald-500/90 dark:bg-emerald-500"),
  label: "Available",
  tooltip: "This training is available and can be selected.",
};

const DO_ONLINE: ToolCardInfo = {
  name: "DO_ONLINE",
  icon: Monitor,
  colour: cn("bg-amber-500/90 dark:bg-amber-500"),
  label: "Online Required",
  tooltip: "The user needs to complete the online training module first.",
};

const DO_IN_PERSON: ToolCardInfo = {
  name: "DO_IN_PERSON",
  icon: MapPin,
  colour: cn("bg-cyan-500/90 text-white dark:bg-cyan-500 dark:text-white"),
  label: "In-Person Required",
  tooltip: "This training requires an in-person session.",
};

const NONE_REMAINING: ToolCardInfo = {
  name: "NONE_REMAINING",
  icon: UserX,
  colour: cn("bg-red-500/90 dark:bg-red-500"),
  label: "No Tools Remaining",
  tooltip: "There are no remaining tools available.",
};

const DO_IN_PERSON_OR_REP_ONLINE: ToolCardInfo = {
  name: "DO_IN_PERSON_OR_REP_ONLINE",
  icon: GitMerge,
  colour: cn("bg-blue-500/90 dark:bg-blue-500"),
  label: "In-Person or Rep Online",
  tooltip: "This training can be completed in-person or online with a rep.",
};

const DO_REP_ONLINE: ToolCardInfo = {
  name: "DO_REP_ONLINE",
  icon: Video,
  colour: cn("bg-sky-500/90 dark:bg-sky-500"),
  label: "Rep Online Required",
  tooltip: "A rep needs to complete the online training for this.",
};

const DO_IN_PERSON_OR_REP_IN_PERSON: ToolCardInfo = {
  name: "DO_IN_PERSON_OR_REP_IN_PERSON",
  icon: Users,
  colour: cn("bg-indigo-500/90 dark:bg-indigo-500"),
  label: "In-Person or Rep In-Person",
  tooltip: "This training can be completed in-person or with a rep in-person.",
};

const DO_REP_IN_PERSON: ToolCardInfo = {
  name: "DO_REP_IN_PERSON",
  icon: UserCheck,
  colour: cn("bg-violet-500/90 dark:bg-violet-500"),
  label: "Rep In-Person Required",
  tooltip: "A rep needs to conduct an in-person training for this.",
};

const TOOL_BROKEN: ToolCardInfo = {
  name: "TOOL_BROKEN",
  icon: Wrench,
  colour: cn("bg-zinc-500/90 dark:bg-zinc-600"),
  label: "Tool Broken",
  tooltip: "The associated tool is currently broken and unavailable for training.",
};

const REPS_UNTRAINED: ToolCardInfo = {
  name: "REPS_UNTRAINED",
  icon: NoRepIcon,
  colour: cn("bg-orange-500/90 dark:bg-orange-500"),
  label: "Reps Untrained",
  tooltip: "The on-shift reps for this training are not yet trained on the associated machine for this.",
};

const REVOKED: ToolCardInfo = {
  name: "REVOKED",
  icon: Ban,
  colour: cn("bg-red-500/90 dark:bg-red-500"),
  label: "Revoked",
  tooltip: "This training has been revoked due to an infraction and has not been retaken since.",
};

const EXPIRED: ToolCardInfo = {
  name: "EXPIRED",
  icon: Clock,
  colour: cn("bg-purple-500/90 dark:bg-purple-500"),
  label: "Expired",
  tooltip: "This training has expired and needs to be retaken.",
};

const UNREACHABLE: ToolCardInfo = {
  name: "UNREACHABLE",
  icon: HelpCircle,
  colour: "bg-zinc-800 dark:bg-zinc-900",
  label: "Unknown Status",
  tooltip: "The status of this training is unknown. Please contact IT.",
};

const STATUS_MAP: Record<tools.Selectability, ToolCardInfo> = {
  DO_ONLINE,
  DO_IN_PERSON,
  NONE_REMAINING,
  DO_IN_PERSON_OR_REP_ONLINE,
  DO_REP_ONLINE,
  DO_IN_PERSON_OR_REP_IN_PERSON,
  DO_REP_IN_PERSON,
  REPS_UNTRAINED,
  TOOL_BROKEN,
  REVOKED,
  EXPIRED,
  NONE: SELECTABLE,
};

export const LEGEND_ITEMS: ToolCardInfo[] = [
  SELECTABLE,
  DO_ONLINE,
  DO_IN_PERSON,
  DO_IN_PERSON_OR_REP_ONLINE,
  DO_IN_PERSON_OR_REP_IN_PERSON,
  DO_REP_ONLINE,
  DO_REP_IN_PERSON,
  NONE_REMAINING,
  REPS_UNTRAINED,
  TOOL_BROKEN,
  REVOKED,
  EXPIRED,
];

export const getToolCardInfo = (tool: Tool): [ToolCardInfo, ...ToolCardInfo[]] => {
  if (!tool.selectable.length) return [SELECTABLE];
  return tool.selectable.map((key) => STATUS_MAP[key] || UNREACHABLE) as [ToolCardInfo, ...ToolCardInfo[]];
};

export function ToolLegend() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" className="h-8 gap-1.5 text-muted-foreground">
          Legend
          <HelpCircle className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="w-56 p-2">
        <div className="flex flex-col gap-1">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className={cn(item.colour, "px-1 py-1 border border-white/10 shrink-0")}>
                <item.icon className="size-3 text-white" />
              </Badge>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
