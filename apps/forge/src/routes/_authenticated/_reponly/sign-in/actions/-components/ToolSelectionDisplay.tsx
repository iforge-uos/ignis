import { Training } from "@ignis/types/sign_in";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@ui/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/components/ui/collapsible";
import { useState } from "react";
import ToolSelectionList from "./TrainingSelectionList";
import { CategoryTrainingMap, TrainingStatus } from "@ignis/types/sign_in";

interface ToolSelectionDisplayProps {
  trainingMap: CategoryTrainingMap;
  onTrainingSelect: (selectedTrainings: Training[]) => void;
  className?: string;
}

export const ToolSelectionDisplay = ({ trainingMap, onTrainingSelect, className = "" }: ToolSelectionDisplayProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const missingCompulsoryTraining = trainingMap.DISABLED.filter((training) => training.compulsory);
  const userHasCompulsoryTraining = missingCompulsoryTraining.length === 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={`w-full space-y-2 ${className}`}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex items-center justify-between space-x-4 px-4 w-full">
          <h4 className="text-sm font-semibold">Select Training</h4>
          {isOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
          <span className="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>

      {userHasCompulsoryTraining ? (
        <ToolSelectionList
          title="Selectable Training"
          trainings={trainingMap.SELECTABLE}
          selectable={true}
          onTrainingSelect={onTrainingSelect}
          toolTipContent="Tools that the user has training for, and reps are trained on the tool"
        />
      ) : (
        <Alert variant="default">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Cannot Sign In</AlertTitle>
          <AlertDescription>
            Compulsory training {missingCompulsoryTraining.map((training) => `"${training.name}"`).join(", ")} has not
            been completed.
          </AlertDescription>
        </Alert>
      )}

      <CollapsibleContent className="space-y-2">
        <ToolSelectionList
          title="Un-selectable Training"
          trainings={trainingMap.UNSELECTABLE}
          toolTipContent="Tools that the user has training for, but reps are not trained on the tool or the tools that the user hasn't completed the in-person training for yet."
        />
        <ToolSelectionList
          title="Un-acquired Training"
          trainings={trainingMap.DISABLED}
          toolTipContent="Tools the user aren't trained to use"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
