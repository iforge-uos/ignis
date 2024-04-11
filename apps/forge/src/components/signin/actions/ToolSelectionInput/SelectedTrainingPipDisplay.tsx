import { Training } from "@ignis/types/sign_in";
import { Badge } from "@ui/components/ui/badge";
import React from "react";

interface SelectedTrainingPipDisplayProps {
  selectedTrainings: Training[];
}

export const SelectedTrainingPipDisplay: React.FC<SelectedTrainingPipDisplayProps> = ({ selectedTrainings }) => {
  return (
    <>
      <div>
        {selectedTrainings.map((training) => (
          <Badge key={training.id} className="mr-2 mb-2">
            {training.name}
          </Badge>
        ))}
      </div>
    </>
  );
};
