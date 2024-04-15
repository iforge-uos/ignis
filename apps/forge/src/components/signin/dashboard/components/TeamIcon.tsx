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

export default function TeamIcon({ team, ...props }: { team: string } & React.ComponentProps<LucideIcon>) {
  switch (removeSuffix(team, "Team").trim()) {
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
      throw new Error("Sorry your team has been forgotten... about cry harder");
  }
}
