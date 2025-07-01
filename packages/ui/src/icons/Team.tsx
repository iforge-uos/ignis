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
import { team } from "@/db/interfaces";

export default function Team({ team, ...props }: { team: team.Name } & React.ComponentProps<LucideIcon>) {
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
      unreachable()
  }
}

export const TeamIcon = Team;
