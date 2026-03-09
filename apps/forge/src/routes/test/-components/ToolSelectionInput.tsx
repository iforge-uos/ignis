import { Training, User } from "@ignis/types/sign_in";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  activeLocationAtom,
  sessionNavigationBacktrackingAtom,
  sessionTrainingAtom,
  sessionUcardNumberAtom,
  sessionUserAtom,
} from "@/atoms/signInAppAtoms";
import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { Hammer } from "@/components/loading";
import { SelectedTrainingPipDisplay } from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SelectedTrainingPipDisplay";
import {ToolSelection} from "./TrainingSelectionList";
import { FlowStepComponent } from "@/types/signInActions";
import { useSignIn } from "/src/providers/SignInSteps";

export const Tools: FlowStepComponent<"TOOLS"> = ({ user, data: {tools} }) => {
  const [selectedTools, setSelectedTools] = useState<typeof tools>([]);

  const {canContinue, setCanContinue} = useSignIn<"TOOLS">(async (transmit) => {
    await transmit({ tools: selectedTools });
  });

  // const handleOnTrainingSelect = (selectedTrainings: Training[]) => {
  //   setSelectedTools(selectedTrainings);
  //   setCanContinue(selectedTrainings.length > 0);
  // };


  const missingCompulsoryTraining =
    tools.filter((tool) => //tool.compulsory &&
    tool.selectable.includes("NONE")) || [];
  const userMissingCompulsoryTraining = missingCompulsoryTraining.length !== 0;

  return (
    <>
      <CardHeader>
        <CardTitle>Tool Selection Input</CardTitle>
        <CardDescription>Select which tools you would like to use</CardDescription>
      </CardHeader>
      <CardContent>
        {userMissingCompulsoryTraining ? (
          <Alert variant="default">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Cannot Sign In</AlertTitle>
            <AlertDescription>
              Compulsory training {missingCompulsoryTraining.map((training) => `"${training.name}"`).join(", ")} has not
              been completed.
            </AlertDescription>
          </Alert>
        ) : (
          <ToolSelection
            // onSelectionChange={handleOnTrainingSelect}
            tools={tools || []}
            // onSubmit={handlePrimaryClick}
          />
        )}
      </CardContent>
    </>
  );
};
