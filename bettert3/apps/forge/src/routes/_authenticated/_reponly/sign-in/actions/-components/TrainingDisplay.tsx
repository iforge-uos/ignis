import { Training } from "@ignis/types/sign_in";
import { Button } from "@ui/components/ui/button";
import React from "react";

interface TrainingDisplayProps {
  training: Training;
  selected?: boolean;
  selectable?: boolean;
  wholeClickable?: boolean;
  onClick: (training: Training) => void;
}

const TrainingDisplay: React.FC<TrainingDisplayProps> = ({
  training,
  selected,
  selectable,
  wholeClickable = true,
  onClick,
}) => {
  // Function to handle clicks for the whole component if wholeClickable is true
  const handleWholeClick = () => {
    if (wholeClickable) onClick(training);
  };

  return (
    <div
      className={`flex items-center border-2 justify-between w-full px-4 py-2 text-sm font-medium leading-none rounded-md
                        ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
                        ${wholeClickable ? "hover:bg-accent text-accent-foreground cursor-pointer" : ""}
                        dark:text-gray-300`}
      onClick={wholeClickable ? handleWholeClick : undefined} // Apply click handler if wholeClickable
      onKeyUp={(event) => {
        // Handle the 'Enter' key to mimic mouse click interaction
        if (event.key === "Enter") {
          wholeClickable ? handleWholeClick() : undefined;
        }
      }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-none truncate dark:text-gray-300">{training.name}</p>
        </div>
      </div>
      {selectable &&
        !wholeClickable && ( // Only show button if selectable but not wholeClickable
          <div className="flex items-center space-x-4">
            <Button type="button" variant={selected ? "outline" : "default"} onClick={() => onClick(training)}>
              {selected ? "Deselect" : "Select"}
            </Button>
          </div>
        )}
    </div>
  );
};

export default TrainingDisplay;
