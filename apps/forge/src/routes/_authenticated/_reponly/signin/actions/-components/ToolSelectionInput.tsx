import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { signinActions, useSignInSessionField } from "@/redux/signin.slice.ts";
import { AppDispatch, AppRootState } from "@/redux/store.ts";
import { SelectedTrainingPipDisplay } from "@/routes/_authenticated/_reponly/signin/actions/-components/SelectedTrainingPipDisplay.tsx";
import ToolSelectionList from "@/routes/_authenticated/_reponly/signin/actions/-components/TrainingSelectionList.tsx";
import { GetSignIn, GetSignInProps } from "@/services/signin/signInService.ts";
import { FlowStepComponent } from "@/types/signInActions.ts";
import { Training, User } from "@ignis/types/sign_in.ts";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/components/ui/collapsible.tsx";
import { Loader } from "@ui/components/ui/loader.tsx";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

/*
three categories of tools that can be selected:
- SELECTABLE: Tools that the user has training for, and reps are trained on the tool
- UNSELECTABLE (next highest priority): Tools that the user has training for, but reps are not trained on the tool
- DISABLED: Tools that the user does not have training for (not sure how to get for now)
 */
export type TrainingStatus = "SELECTABLE" | "UNSELECTABLE" | "DISABLED";

export type CategoryTrainingMap = Record<TrainingStatus, Training[]>;

const ToolSelectionInput: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const abortController = new AbortController(); // For gracefully cancelling the query

  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const uCardNumber = useSignInSessionField("ucard_number");
  const user = useSignInSessionField("user");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [trainingMap, setTrainingMap] = useState<CategoryTrainingMap>({
    SELECTABLE: [],
    UNSELECTABLE: [],
    DISABLED: [],
  });

  const [selectedTrainings, setSelectedTrainings] = useState<Training[]>([]);
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();

  // Check if the user is backtracking (do not auto send the user back to the previous step)
  const isBackTracking = useSelector(
    (state: AppRootState) => state.signin.session?.navigation_is_backtracking ?? false,
  );

  const signInProps: GetSignInProps = {
    locationName: activeLocation,
    uCardNumber: uCardNumber ?? "",
    signal: abortController.signal,
  };
  // Using the useQuery hook to fetch the sign-in data
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
    if (selectedTrainings.length > 0) {
      setCanContinue(true);
      return;
    }
    setCanContinue(false);
  };

  const parseData = (data: User | undefined) => {
    if (!data) {
      return;
    }
    const selectAbleTraining: Training[] = [];
    const unselectAbleTraining: Training[] = [];
    const disabledTraining: Training[] = [];
    dispatch(signinActions.updateSignInSessionField("user", data));
    const isRep = data.roles.some((role) => role.name === "Rep");

    if (isRep && !isBackTracking) {
      console.log("User is a rep && not backtracking");
      // Dispatch the action directly instead of setting state
      dispatch(signinActions.updateSignInSessionField("training", []));

      onPrimary?.(); // Proceed to the next step
      return; // Exit the function
    }
    if (isRep && isBackTracking) {
      console.log("User is a rep && backtracking");
      // Dispatch the action directly instead of setting state
      setCanContinue(true);
      return; // Exit the function
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

  // Parse the data once it is fetched

  useEffect(() => {
    parseData(data);
    setSelectedTrainings([]);
    dispatch(signinActions.updateSignInSessionField("navigation_is_backtracking", false));
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
      dispatch(signinActions.updateSignInSessionField("training", selectedTrainings));
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
