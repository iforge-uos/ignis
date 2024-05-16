import { Category } from "@/components/icons/SignInReason.tsx";
import { cn } from "@/lib/utils.ts";
import { PartialReason } from "@ignis/types/sign_in.ts";
import { Badge } from "@ui/components/ui/badge.tsx";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@ui/components/ui/tooltip.tsx";

export const SignInReason = ({ reason, className }: { reason: PartialReason; className?: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center font-mono mt-2 flex justify-center">
            <Badge
              variant="default"
              className={cn("max-w-48 rounded-sm shadow-lg justify-center items-center", className)}
            >
              {<Category category={reason.category} className="mr-1" />}
              {reason.category === "UNIVERSITY_MODULE" ? reason.name.split(" ")[0] : reason.name}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{reason.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
