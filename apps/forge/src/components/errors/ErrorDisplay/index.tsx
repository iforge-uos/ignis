import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { extractError } from "@/lib/utils";
import { FC } from "react";

export interface ErrorDisplayProps {
  error: Error | null;
}

export const errorDisplay: FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <>
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="text-balance">
          <p> There was an error trying to complete your action</p>
          <div className="mt-2 mb-2 rounded-lg p-2 bg-card text-card-foreground"> {extractError(error!)}</div>
          <p> Please check your inputs and try again!</p>
          <p> Otherwise contact the IT-Team</p>
        </AlertDescription>
      </Alert>
    </>
  );
};
