import { removeSuffix } from "@/lib/utils";
import {
  BarChart4,
  Box,
  CalendarIcon,
  Cog,
  Computer,
  Construction,
  Diamond,
  Hammer,
  HardHat,
  LucideIcon,
  Megaphone,
  Puzzle,
  Send,
  Users,
} from "lucide-react";
import * as React from "react";

type TeamName =
  | "IT"
  | "3DP"
  | "Hardware"
  | "Publicity"
  | "Events"
  | "Relations"
  | "Operations"
  | "Recruitment & Development"
  | "Health & Safety"
  | "Inclusions"
  | "Unsorted Reps"
  | "Future Reps"
  | "Staff"

export default function Team({ team, ...props }: { team: TeamName } & React.ComponentProps<LucideIcon>) {
  switch (team) {
    case "IT":
      return <Computer {...props} />;
    case "3DP":
      return <Box {...props} />;
    case "Hardware":
      return <Hammer {...props} />;
    case "Publicity":
      return <Megaphone {...props} />;
    case "Events":
      return <CalendarIcon {...props} />;
    case "Relations":
      return <Send {...props} />;
    case "Operations":
      return <Cog />;
    case "Recruitment & Development":
      return <BarChart4 {...props} />; // stonks?
    case "Health & Safety":
      return <HardHat {...props} />;
    case "Inclusions":
      return <Users {...props} />;
    case "Unsorted Reps":
      return <Puzzle {...props} />;
    case "Future Reps":
      return <Construction {...props} />;
    case "Staff":
      return <Diamond {...props} />;
    default:
      throw new Error("Sorry your team has been forgotten about... cry harder");
  }
}

export const TeamIcon = Team;
