import { PostRegister, PostRegisterProps } from "@/services/signin/signInService.ts";
import { useMutation } from "@tanstack/react-query";
import { AppDispatch, AppRootState } from "@/redux/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card.tsx";

import { Loader } from "@ui/components/ui/loader.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { useState } from "react";
import { signinActions } from "@/redux/signin.slice.ts";
import { FlowStepComponent } from "@/types/signInActions.ts";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { errorDisplay } from "@/components/errors/ErrorDisplay";

const RegisterDispatcher: FlowStepComponent = ({ onSecondary, onPrimary }) => {
  const dispatch: AppDispatch = useDispatch();
  const signInSession = useSelector((state: AppRootState) => state.signin.session);
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const abortController = new AbortController(); // For gracefully cancelling the query
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const navigate = useNavigate();
  const timeout = 3000;

  const registerProps: PostRegisterProps = {
    locationName: activeLocation,
    uCardNumber: signInSession?.ucard_number ?? "",
    signal: abortController.signal,
  };

  const { isPending, error, mutate } = useMutation({
    mutationKey: ["postRegister", registerProps],
    mutationFn: () => PostRegister(registerProps),
    retry: 0,
    onMutate: () => {
      setTimeout(() => {
        console.log("Aborting request deadline exceeded");
        abortController.abort();
      }, 20_000);
    },
    onError: (error) => {
      console.log("Error", error);
      abortController.abort();
    },
    onSuccess: () => {
      console.log("Success");
      setCanContinue(true);
      abortController.abort();
      dispatch(signinActions.resetSignInSession());
      toast.success("User registered successfully");
      navigate({ to: "/signin/actions" });
    },
  });

  const successDisplay = (
    <>
      <div className="flex justify-items-center justify-center">
        <h1 className="text-xl flex-auto">Success!</h1>
        <p className="text-sm">Possibly redirecting to actions page in ~{timeout / 1000} seconds...</p>
      </div>
    </>
  );

  const handleSecondaryClick = () => {
    abortController.abort();
    onSecondary?.();
  };

  const handlePrimaryClick = () => {
    if (canContinue) {
      abortController.abort();
      onPrimary?.();
      console.log("Done ");
      dispatch(signinActions.resetSignInSession());
    }
  };

  return (
    <>
      <Card className="w-[700px]">
        <CardHeader>
          <CardTitle>Registering User</CardTitle>
        </CardHeader>
        <CardContent>
          {!(canContinue || error || isPending) && (
            <Button onClick={() => mutate()} autoFocus={true} variant="outline" className="h-[200px] w-full">
              Register
            </Button>
          )}
          {isPending && <Loader />}
          {!isPending && error && !canContinue && errorDisplay({ error })}
          {!isPending && canContinue && successDisplay}
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

export default RegisterDispatcher;
