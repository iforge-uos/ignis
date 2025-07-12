import { errorDisplay } from "@/components/errors/ErrorDisplay";

import {
  activeLocationAtom,
  sessionNavigationBacktrackingAtom,
  sessionTrainingAtom,
  sessionUcardNumberAtom,
  sessionUserAtom,
} from "@/atoms/signInAppAtoms";
import { Hammer } from "@/components/loading";
import { SelectedTrainingPipDisplay } from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SelectedTrainingPipDisplay";
import ToolSelectionList from "@/routes/_authenticated/_reponly/sign-in/actions/-components/TrainingSelectionList";
import { FlowStepComponent } from "@/types/signInActions";
import { Training, User } from "@ignis/types/sign_in";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";

const ToolSelectionInput: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const abortController = new AbortController();

  const [activeLocation] = useAtom(activeLocationAtom);
  const [uCardNumber] = useAtom(sessionUcardNumberAtom);
  const [user, setSessionUser] = useAtom(sessionUserAtom);
  const [training, setTraining] = useAtom(sessionTrainingAtom);
  const [isBackTracking, setNavigationIsBacktracking] = useAtom(sessionNavigationBacktrackingAtom);

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
  const isRep = useMemo(() => Boolean(data?.roles.some((role) => role.name === "Rep")), [data]);

  const handleOnTrainingSelect = (selectedTrainings: Training[]) => {
    setSelectedTrainings(selectedTrainings);
    setCanContinue(selectedTrainings.length > 0);
  };

  const parseData = (data: User | undefined) => {
    if (!data) return;

    // Update user in session
    setSessionUser(data);

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

    setTraining(data.training);
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
    if (canContinue || isRep) {
      abortController.abort();
      onPrimary?.();
      console.log("Selected Trainings: ", selectedTrainings);
      setTraining(selectedTrainings);
    }
  };
  const missingCompulsoryTraining =
    training?.filter((training) => training.compulsory && training.selectable.length !== 0) || [];
  const userMissingCompulsoryTraining = missingCompulsoryTraining.length !== 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tool Selection Input</CardTitle>
          <CardDescription>Select which training (tools) you would like to use!</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Hammer />
          ) : error ? (
            errorDisplay({ error })
          ) : userMissingCompulsoryTraining ? (
            <Alert variant="default">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Cannot Sign In</AlertTitle>
              <AlertDescription>
                Compulsory training {missingCompulsoryTraining.map((training) => `"${training.name}"`).join(", ")} has
                not been completed.
              </AlertDescription>
            </Alert>
          ) : (
            <ToolSelectionList
              onSelectionChange={handleOnTrainingSelect}
              training={training || []}
              onSubmit={handlePrimaryClick}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between flex-row-reverse">
          <Button onClick={handlePrimaryClick} disabled={!(canContinue || isRep)}>
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
