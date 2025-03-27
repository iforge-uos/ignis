import { cn } from "@/lib/utils";
import { PartialReason } from "@ignis/types/sign_in";
import { Category } from "@ui/components/icons/SignInReason";
import { Badge } from "@ui/components/ui/badge";
import { Kbd } from "@ui/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";

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
