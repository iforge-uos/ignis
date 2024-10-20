import { errorDisplay } from "@/components/errors/ErrorDisplay";
import { signInActions, useSignInSessionField } from "@/redux/sign_in.slice";
import { AppDispatch, AppRootState } from "@/redux/store";
import { GetSignIn, GetSignInProps } from "@/services/sign_in/signInService";
import { FlowStepComponent } from "@/types/signInActions";
import { CategoryTrainingMap, Training, User } from "@ignis/types/sign_in";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Loader } from "@ui/components/ui/loader";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SelectedTrainingPipDisplay } from "./SelectedTrainingPipDisplay";
import { ToolSelectionDisplay } from "./ToolSelectionDisplay";

const ToolSelectionInput: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const abortController = new AbortController();

  const activeLocation = useSelector((state: AppRootState) => state.signIn.active_location);
  const uCardNumber = useSignInSessionField("ucard_number");
  const user = useSignInSessionField("user");

  const [trainingMap, setTrainingMap] = useState<CategoryTrainingMap>({
    SELECTABLE: [],
    UNSELECTABLE: [],
    DISABLED: [],
  });

  const [selectedTrainings, setSelectedTrainings] = useState<Training[]>([]);
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();

  const isBackTracking = useSelector(
    (state: AppRootState) => state.signIn.session?.navigation_is_backtracking ?? false,
  );

  const signInProps: GetSignInProps = {
    locationName: activeLocation,
    uCardNumber: uCardNumber ?? "",
    signal: abortController.signal,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["getSignIn", signInProps],
    queryFn: () => user || GetSignIn(signInProps),
    retry: 1,
  });

  const handleOnTrainingSelect = (selectedTrainings: Training[]) => {
    setSelectedTrainings(selectedTrainings);
    setCanContinue(selectedTrainings.length > 0);
  };

  const parseData = (data: User | undefined) => {
    if (!data) return;

    dispatch(signInActions.updateSignInSessionField("user", data));
    const isRep = data.roles.some((role) => role.name === "Rep");

    if (isRep && !isBackTracking) {
      dispatch(signInActions.updateSignInSessionField("training", []));
      onPrimary?.();
      return;
    }

    if (isRep && isBackTracking) {
      setCanContinue(true);
      return;
    }

    const categorizedTraining: CategoryTrainingMap = {
      SELECTABLE: data.training.filter((t) => t.selectable === true),
      UNSELECTABLE: data.training.filter((t) => t.selectable === false),
      DISABLED: data.training.filter((t) => t.selectable === undefined),
    };

    setTrainingMap(categorizedTraining);
  };

  useEffect(() => {
    parseData(data);
    setSelectedTrainings([]);
    dispatch(signInActions.updateSignInSessionField("navigation_is_backtracking", false));
  }, [data]);

  const handleSecondaryClick = () => {
    abortController.abort();
    onSecondary?.();
  };

  const handlePrimaryClick = () => {
    if (canContinue) {
      abortController.abort();
      dispatch(signInActions.updateSignInSessionField("training", selectedTrainings));
      onPrimary?.();
    }
  };

  return (
    <Card className="w-[700px]">
      <CardHeader>
        <CardTitle>Tool Selection Input</CardTitle>
        <CardDescription>Select which training (tools) you would like to use!</CardDescription>
        <SelectedTrainingPipDisplay selectedTrainings={selectedTrainings} />
      </CardHeader>
      <CardContent>
        {isLoading && <Loader />}
        {!isLoading && error && errorDisplay({ error })}
        {!(isLoading || error) && (
          <ToolSelectionDisplay trainingMap={trainingMap} onTrainingSelect={handleOnTrainingSelect} />
        )}
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
  );
};

export default ToolSelectionInput;
