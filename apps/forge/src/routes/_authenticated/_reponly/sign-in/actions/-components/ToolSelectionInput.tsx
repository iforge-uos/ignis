import { errorDisplay } from "@/components/errors/ErrorDisplay";

import { SelectedTrainingPipDisplay } from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SelectedTrainingPipDisplay.tsx";
import ToolSelectionList from "@/routes/_authenticated/_reponly/sign-in/actions/-components/TrainingSelectionList.tsx";
import { GetSignIn, GetSignInProps } from "@/services/sign_in/signInService";
import { FlowStepComponent } from "@/types/signInActions.ts";
import { Training, User } from "@ignis/types/sign_in.ts";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/components/ui/collapsible.tsx";
import { Loader } from "@ui/components/ui/loader.tsx";
import { useAtom } from "jotai";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
  activeLocationAtom,
  sessionNavigationBacktrackingAtom,
  sessionTrainingAtom,
  sessionUcardNumberAtom,
  sessionUserAtom
} from "@/atoms/signInAppAtoms.ts";

/*
three categories of tools that can be selected:
- SELECTABLE: Tools that the user has training for, and reps are trained on the tool
- UNSELECTABLE (next highest priority): Tools that the user has training for, but reps are not trained on the tool
- DISABLED: Tools that the user does not have training for (not sure how to get for now)
 */
export type TrainingStatus = "SELECTABLE" | "UNSELECTABLE" | "DISABLED";

export type CategoryTrainingMap = Record<TrainingStatus, Training[]>;

const ToolSelectionInput: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const abortController = new AbortController();

  const [activeLocation] = useAtom(activeLocationAtom);
  const [uCardNumber] = useAtom(sessionUcardNumberAtom);
  const [user, setSessionUser] = useAtom(sessionUserAtom);
  const [, setTraining] = useAtom(sessionTrainingAtom);
  const [isBackTracking, setNavigationIsBacktracking] = useAtom(sessionNavigationBacktrackingAtom);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [trainingMap, setTrainingMap] = useState<CategoryTrainingMap>({
    SELECTABLE: [],
    UNSELECTABLE: [],
    DISABLED: [],
  });

  const [selectedTrainings, setSelectedTrainings] = useState<Training[]>([]);
  const [canContinue, setCanContinue] = useState<boolean>(false);

  const signInProps: GetSignInProps = {
    locationName: activeLocation,
    uCardNumber: uCardNumber ?? "",
    signal: abortController.signal,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["getSignIn", signInProps],
    queryFn: () => {
      if (user) {
        return user;
      }
      return GetSignIn(signInProps);
    },
    retry: 1,
  });

  const handleOnTrainingSelect = (selectedTrainings: Training[]) => {
    setSelectedTrainings(selectedTrainings);
    setCanContinue(selectedTrainings.length > 0);
  };

  const parseData = (data: User | undefined) => {
    if (!data) return;

    const selectAbleTraining: Training[] = [];
    const unselectAbleTraining: Training[] = [];
    const disabledTraining: Training[] = [];

    // Update user in session
    setSessionUser(data)

    const isRep = data.roles.some((role) => role.name === "Rep");

    if (isRep && !isBackTracking) {
      console.log("User is a rep && not backtracking");
      setTraining([]);
      onPrimary?.();
      return;
    }

    if (isRep && isBackTracking) {
      console.log("User is a rep && backtracking");
      setCanContinue(true);
      return;
    }

    if (!isRep) {
      for (const training of data.training) {
        if (training.selectable === true) {
          selectAbleTraining.push(training);
        } else if (training.selectable === false) {
          unselectAbleTraining.push(training);
        } else {
          disabledTraining.push(training);
        }
      }
    }

    setTrainingMap({
      SELECTABLE: selectAbleTraining,
      UNSELECTABLE: unselectAbleTraining,
      DISABLED: disabledTraining,
    });
  };

  useEffect(() => {
    parseData(data);
    setSelectedTrainings([]);
    setNavigationIsBacktracking(false);
  }, [data]);

  const handleSecondaryClick = () => {
    abortController.abort();
    onSecondary?.();
  };

  const handlePrimaryClick = () => {
    if (canContinue) {
      abortController.abort();
      onPrimary?.();
      console.log("Selected Trainings: ", selectedTrainings);
      setTraining(selectedTrainings);
    }
  };

  const missingCompulsoryTraining = trainingMap.DISABLED.filter((training) => training.compulsory);
  const userHasCompulsoryTraining = missingCompulsoryTraining.length === 0;

  const toolSelectionDisplay = (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center justify-between space-x-4 px-4 w-full">
            <h4 className="text-sm font-semibold">Select Training</h4>
            {isOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <>
          {userHasCompulsoryTraining ? (
            <ToolSelectionList // TODO honestly think this is best as a single list but with symbols for selectiblity, then we can have fulltextsearch
              title="Selectable Training"
              trainings={trainingMap.SELECTABLE}
              selectable={true}
              onTrainingSelect={handleOnTrainingSelect}
              toolTipContent="Tools that the user has training for, and reps are trained on the tool"
            />
          ) : (
            <Alert variant="default">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Cannot Sign In</AlertTitle>
              <AlertDescription>
                Compulsory training {missingCompulsoryTraining.map((training) => `"${training.name}"`).join(", ")} has
                not been completed.
              </AlertDescription>
            </Alert>
          )}
          <CollapsibleContent className="space-y-2">
            <ToolSelectionList
              title="Un-selectable Training"
              trainings={trainingMap.UNSELECTABLE} // TODO allow these to be SELECTABLE but pop a warning saying that they need to be trained (only if the reps are trained to give it.)
              toolTipContent="Tools that the user has training for, but reps are not trained on the tool or the tools that the user hasn't completed the in-person training for yet."
            />
            <ToolSelectionList
              title="Un-acquired Training"
              trainings={trainingMap.DISABLED}
              toolTipContent="Tools the user aren't trained to use"
            />
          </CollapsibleContent>
        </>
      </Collapsible>
    </>
  );

  return (
    <>
      <Card className="w-[700px]">
        <CardHeader>
          <CardTitle>Tool Selection Input</CardTitle>
          <CardDescription>Select which training (tools) you would like to use!</CardDescription>
          <SelectedTrainingPipDisplay selectedTrainings={selectedTrainings} />
        </CardHeader>
        <CardContent>
          {isLoading && <Loader />}
          {!isLoading && error && errorDisplay({ error })}
          {!(isLoading || error) && toolSelectionDisplay}
        </CardContent>
        <CardFooter className="flex justify-between flex-row-reverse">
          <Button onClick={handlePrimaryClick} disabled={!canContinue}>
            Continue
          </Button>
          <Button onClick={handleSecondaryClick} variant="outline">
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default ToolSelectionInput;
