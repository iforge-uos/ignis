import { cn } from "@/lib/utils.ts";
import TrainingDisplay from "@/routes/_authenticated/_reponly/sign-in/actions/-components/TrainingDisplay.tsx";
import { Training } from "@ignis/types/sign_in.ts";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { ScrollArea } from "@ui/components/ui/scroll-area.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";
import { Info } from "lucide-react";
import React, { useState } from "react";

interface ToolSelectionListProps {
  trainings: Training[];
  title: string;
  toolTipContent: string;
  selectable?: boolean;
  onTrainingSelect?: (selectedTrainings: Training[]) => void;
  initialSelection?: string[];
}

const TrainingSelectionList: React.FC<ToolSelectionListProps> = ({
  trainings,
  title,
  toolTipContent,
  selectable,
  onTrainingSelect,
  initialSelection,
}) => {
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>(initialSelection ?? []);

  const handleTrainingClick = (clickedTraining: Training) => {
    if (selectable) {
      const isAlreadySelected = selectedTrainings.includes(clickedTraining.id);

      const newSelectedTrainings = isAlreadySelected
        ? selectedTrainings.filter((id) => id !== clickedTraining.id)
        : [...selectedTrainings, clickedTraining.id];

      setSelectedTrainings(newSelectedTrainings);

      if (onTrainingSelect) {
        const selectedTrainingObjects = trainings.filter((training) => newSelectedTrainings.includes(training.id));
        onTrainingSelect(selectedTrainingObjects);
      }
    }
  };

  const scrollAreaHeightClass = trainings.length > 0 ? "h-[300px]" : "h-full";

  return (
    <ScrollArea
      className={cn(
        "w-full rounded-md border-2 border-gray-200 dark:border-black dark:border-opacity-15 shadow-md",
        scrollAreaHeightClass,
      )}
    >
      <div className="p-4 space-y-2">
        <div className="flex items-center mb-4">
          <h4 className="mr-2 text-sm font-medium leading-none text-foreground">{title}</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info />
              </TooltipTrigger>
              <TooltipContent>{toolTipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {trainings.length === 0 ? (
          <Alert variant="default">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>No training available to select.</AlertDescription>
          </Alert>
        ) : (
          trainings
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((training) => (
              <TrainingDisplay
                key={training.id}
                training={training}
                selected={selectedTrainings.includes(training.id)}
                selectable={selectable}
                onClick={() => handleTrainingClick(training)}
              />
            ))
        )}
      </div>
    </ScrollArea>
  );
};

export default TrainingSelectionList;
