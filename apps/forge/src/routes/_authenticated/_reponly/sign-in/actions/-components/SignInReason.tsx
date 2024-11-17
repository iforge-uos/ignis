import { Category } from "@/components/icons/SignInReason.tsx";
import { cn } from "@/lib/utils.ts";
import { PartialReason } from "@ignis/types/sign_in.ts";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Kbd } from "@ui/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";

export const SignInReason = ({
  reason,
  index,
  className,
}: { reason: PartialReason; index?: number; className?: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center font-mono mt-2 flex justify-center">
            <Badge
              variant="default"
              className={cn("max-w-48 rounded-sm shadow-lg justify-center items-center", className)}
            >
              {index !== undefined ? <Kbd className="mr-1">F{index + 1}</Kbd> : null}
              {<Category category={reason.category} />}
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
