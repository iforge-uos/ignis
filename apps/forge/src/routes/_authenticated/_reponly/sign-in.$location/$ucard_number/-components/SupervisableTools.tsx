import { CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Badge } from "@packages/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useSignIn } from "@/providers/SignInSteps";
import type { FlowStepComponent } from "@/types/signInActions";
import { getToolCardInfo, ToolLegend } from "./ToolLegend";

export const SupervisableTools: FlowStepComponent<"SUPERVISABLE_TOOLS"> = ({ data: { tools } }) => {
  const { setCanContinue, focusNextStep } = useSignIn<"SUPERVISABLE_TOOLS">(async (transmit) => {
    await transmit({});
  });

  const sortedTools = useMemo(() => [...tools].sort((a, b) => a.name.localeCompare(b.name)), [tools]);

  useEffect(() => {
    setCanContinue(true);
    focusNextStep();
  }, [setCanContinue, focusNextStep]);

  return (
    <>
      <CardHeader>
        <CardTitle>Tools You Can Supervise</CardTitle>
        <CardDescription className="flex justify-between">
          <p>Review your supervisable tools</p>
          <div className="flex justify-end">
            <ToolLegend />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedTools.length ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTools.map((tool) => (
              <li key={tool.id} className="rounded-sm border px-3 py-2 h-full">
                <div className="flex items-start justify-between gap-3 h-full">
                  <span className="text-sm font-medium">{tool.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {getToolCardInfo(tool).map((entry) => (
                      <Tooltip key={`${tool.id}-${entry.name}`}>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className={cn(
                              entry.colour,
                              "px-1 py-1 text-[10px] text-white font-medium rounded-sm border border-white/10 backdrop-blur-sm leading-none",
                            )}
                          >
                            <entry.icon className="size-3.5 shrink-0 text-white" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{entry.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No supervisable tools are available at this location.</p>
        )}
      </CardContent>
    </>
  );
};
