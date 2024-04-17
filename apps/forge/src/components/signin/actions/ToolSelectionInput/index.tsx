import { FlowStepComponent } from "@/components/signin/actions/SignInManager/types.ts";
import { SelectedTrainingPipDisplay } from "@/components/signin/actions/ToolSelectionInput/SelectedTrainingPipDisplay.tsx";
import ToolSelectionList from "@/components/signin/actions/ToolSelectionInput/TrainingSelectionList.tsx";
import { extractError } from "@/lib/utils";
import { signinActions } from "@/redux/signin.slice.ts";
import { AppDispatch, AppRootState } from "@/redux/store.ts";
import { GetSignIn, GetSignInProps } from "@/services/signin/signInService.ts";
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
  const ucardNumber = useSelector((state: AppRootState) => state.signin.session?.ucard_number);

  const [isOpen, setIsOpen] = useState<boolean>(true);
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
    uCardNumber: ucardNumber ?? 0,
    signal: abortController.signal,
  };

  // Using the useQuery hook to fetch the sign-in data
  const { data, isLoading, error } = useQuery({
    queryKey: ["getSignIn", signInProps],
    queryFn: () => GetSignIn(signInProps),
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

  const errorDisplay = (
    <>
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error fetching the sign-in data. Please check UCard number and try again.
          <br />
          {extractError(error!)}
        </AlertDescription>
      </Alert>
    </>
  );

  const toolSelectionDisplay = (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">Select Training</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <ToolSelectionList // TODO honestly think this is best as a single list but with symbols for selectiblity, then we can have fulltextsearch
          title="Selectable Training"
          trainings={trainingMap.SELECTABLE}
          selectable={true}
          onTrainingSelect={handleOnTrainingSelect}
          toolTipContent="Tools that the user has training for, and reps are trained on the tool"
        />
        <CollapsibleContent className="space-y-2">
          <ToolSelectionList
            title="Un-selectable Training"
            trainings={trainingMap.UNSELECTABLE}
            toolTipContent="Tools that the user has training for, but reps are not trained on the tool"
          />
          <ToolSelectionList
            title="Un-acquired Training"
            trainings={trainingMap.DISABLED}
            toolTipContent="Tools the user aren't trained to use"
          />
        </CollapsibleContent>
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
          {!isLoading && error && errorDisplay}
          {!isLoading && !error && toolSelectionDisplay}
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
