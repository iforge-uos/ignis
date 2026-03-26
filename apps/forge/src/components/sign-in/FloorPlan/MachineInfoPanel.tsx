import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { ScrollArea } from "@packages/ui/components/scroll-area";
import { Link } from "@tanstack/react-router";
import { Package, X } from "lucide-react";
import type { ToolGroup } from "./types";
import { getMachineState, stateBadgeVariant, stateLabel } from "./utils/machine";

type MachineInfoPanelProps = {
  machine: ToolGroup;
  onClose: () => void;
};

export function MachineInfoPanel({ machine, onClose }: MachineInfoPanelProps) {
  const state = getMachineState(machine.use_count, machine.quantity);
  const trainingWithIcon = machine.training?.find((training) => training.icon_url);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b p-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{machine.displayName}</p>
          <Badge variant={stateBadgeVariant(state)} className="mt-1">
            {stateLabel(machine)}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {trainingWithIcon?.icon_url ? (
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <img
                src={`/machines/${trainingWithIcon.icon_url}`}
                alt={machine.displayName}
                className="h-full w-full object-contain p-2"
                onError={(event) => {
                  (event.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted">
              <Package className="size-12 text-muted-foreground/40" />
            </div>
          )}
          {machine.description && (
            <div>
              <p className="mb-1 text-sm font-medium">About this machine</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{machine.description}</p>
            </div>
          )}
          {machine.training?.map((training) => (
            <Button asChild variant="outline" key={training.id}>
              <Link to="/training/$id" params={training}>
                Do the training for the {training.name}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
