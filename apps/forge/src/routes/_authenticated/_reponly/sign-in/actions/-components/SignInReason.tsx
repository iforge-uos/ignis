import { cn } from "@/lib/utils";
import { PartialReason } from "@ignis/types/sign_in";
import { Badge } from "@packages/ui/components/badge";
import { Kbd } from "@packages/ui/components/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { Category } from "@packages/ui/icons//SignInReason";

export const SignInReason = ({
  reason,
  index,
  className,
}: { reason: PartialReason; index?: number; className?: string }) => {
  return (
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
  );
};
