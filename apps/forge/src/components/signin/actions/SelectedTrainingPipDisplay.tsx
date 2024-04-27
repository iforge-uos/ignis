import { Training } from "@ignis/types/sign_in.ts";
import { Badge } from "@ui/components/ui/badge.tsx";
import React from "react";

interface SelectedTrainingPipDisplayProps {
  selectedTrainings: Training[];
}

export const SelectedTrainingPipDisplay: React.FC<SelectedTrainingPipDisplayProps> = ({ selectedTrainings }) => {
  return (
    <>
      <div>
        {selectedTrainings.map((training) => (
          <Badge key={training.id} className="mr-2 mb-2 rounded-md">
            {training.name}
          </Badge>
        ))}
      </div>
    </>
  );
};
