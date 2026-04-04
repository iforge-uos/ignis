import { Badge } from "@packages/ui/components/badge";
import { ScrollArea } from "@packages/ui/components/scroll-area";
import { getToolState, stateBadgeVariant, stateLabel } from "@/lib/utils/tools";
import type { ToolGroup } from "./types";

type LegendPanelProps = {
  tools: ToolGroup[];
  selectedId: string | null;
  onSelect: (svgId: string) => void;
};

export function LegendPanel({ tools, selectedId, onSelect }: LegendPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border">
      <div className="shrink-0 border-b p-3">
        <p className="font-semibold">All tools</p>
        <p className="text-xs text-muted-foreground">Click a row or tap a group on the map</p>
      </div>
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-1.5 p-3">
          {tools.map((tool) => {
            const state = getToolState(tool.use_count, tool.quantity);
            const isSelected = selectedId === tool.svgId;

            return (
              <button
                key={tool.svgId}
                type="button"
                onClick={() => onSelect(tool.svgId)}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors hover:bg-accent ${
                  isSelected ? "bg-accent ring-2 ring-ring" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{tool.displayName}</p>
                  <Badge variant={stateBadgeVariant(state)} className="shrink-0 text-xs">
                    {stateLabel(tool)}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
