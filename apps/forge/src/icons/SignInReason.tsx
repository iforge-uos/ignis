import { ReasonCategory } from "@packages/types/sign_in";
import { Bot, Crown, GraduationCap, LucideIcon, PartyPopper, Rocket, UserRound } from "lucide-react";

export const Category = ({ category, ...props }: { category: ReasonCategory } & React.ComponentProps<LucideIcon>) => {
  switch (category) {
    case "UNIVERSITY_MODULE":
      return <GraduationCap {...props} />;
    case "PERSONAL_PROJECT":
      return <UserRound {...props} />;
    case "SOCIETY":
      // ROBOTEERS PLUG WOOO
      return <Bot {...props} />;
    case "REP_SIGN_IN":
      return <Crown {...props} />;
    case "CO_CURRICULAR_GROUP":
      return <Rocket {...props} />;
    case "EVENT":
      return <PartyPopper {...props} />;
    default:
      throw new Error("unreachable");
  }
};

export const CategoryIcon = Category;
