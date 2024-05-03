import QueueDispatcher from "@/components/signin/actions/QueueDispatcher.tsx";
import SignInDispatcher from "@/components/signin/actions/SignInDispatcher.tsx";
import SignInFlowProgress from "@/components/signin/actions/SignInFlowProgress.tsx";
import SignInReasonInput from "@/components/signin/actions/SignInReasonInput.tsx";
import SignOutDispatcher from "@/components/signin/actions/SignOutDispatcher.tsx";
import ToolSelectionInput from "@/components/signin/actions/ToolSelectionInput.tsx";
import UCardInput from "@/components/signin/actions/UCardInput.tsx";
import useDoubleTapEscape from "@/hooks/useDoubleTapEscape.ts";
import { signinActions, useSignInSessionField } from "@/redux/signin.slice.ts";
import { AppDispatch, AppRootState } from "@/redux/store.ts";
import {
  AnyStep,
  EnqueueSteps,
  FlowConfiguration,
  FlowStepComponent,
  FlowType,
  SignInSteps,
  SignOutSteps,
  flowTypeToPrintTable,
} from "@/types/signInActions.ts";
import { SignInSession } from "@/types/signin.ts";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button.tsx";
import React, { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SigningInUserCard from "./SigningInUserCard";

const flowConfig: FlowConfiguration = {
  [FlowType.SignIn]: {
    [SignInSteps.Step1]: UCardInput,
    [SignInSteps.Step2]: ToolSelectionInput,
    [SignInSteps.Step3]: SignInReasonInput,
    [SignInSteps.Step4]: SignInDispatcher,
  },
  [FlowType.SignOut]: {
    [SignOutSteps.Step1]: UCardInput,
    [SignOutSteps.Step2]: SignOutDispatcher,
  },
  [FlowType.Enqueue]: {
    [EnqueueSteps.Step1]: UCardInput,
    [EnqueueSteps.Step2]: QueueDispatcher,
  },
};

const defaultSignInSession: SignInSession = {
  ucard_number: "",
  user: null,
  training: null,
  sign_in_reason: null,
  session_errored: false,
  navigation_is_backtracking: false,
};

interface SignInManagerProps<FlowT extends FlowType | undefined = undefined> {
  initialFlow?: FlowT;
  initialStep?: FlowT extends FlowType ? keyof FlowConfiguration[FlowT] : undefined;
}

export const getStepComponent = (
  currentFlow: FlowType,
  currentStep: SignInSteps | SignOutSteps | RegisterSteps | EnqueueSteps,
  flowConfig: FlowConfiguration,
): FlowStepComponent => {
  switch (currentFlow) {
    case FlowType.SignIn:
      return flowConfig[currentFlow][currentStep as SignInSteps];
    case FlowType.SignOut:
      return flowConfig[currentFlow][currentStep as SignOutSteps];
    case FlowType.Enqueue:
      return flowConfig[currentFlow][currentStep as EnqueueSteps];
    default:
      throw new Error(`Unsupported flow type: ${currentFlow}`);
  }
};

// SignInActionsManager Component
export default function SignInActionsManager<FlowT extends FlowType | undefined = undefined>({
  initialFlow,
  initialStep,
}: SignInManagerProps<FlowT>): React.ReactElement {
  const [currentFlow, setCurrentFlow] = useState<FlowType | null>(null);
  const [currentStep, setCurrentStep] = useState<AnyStep | null>(null);
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const user = useSignInSessionField("user");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleDoubleTapEscape = () => {
    setCurrentFlow(null);
    setCurrentStep(null);
  };

  useDoubleTapEscape(handleDoubleTapEscape);

  // Function to advance to the next step within the current flow
  const moveToNextStep = () => {
    if (currentFlow == null || currentStep == null) return;

    const steps = Object.keys(flowConfig[currentFlow]) as AnyStep[];
    const currentStepIndex = steps.indexOf(currentStep);

    if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      setCurrentStep(nextStep as AnyStep);
    } else {
      setCurrentFlow(null);
      setCurrentStep(null);
    }
  };

  // Function to go back to the previous step within the current flow
  const moveToPreviousStep = () => {
    if (currentFlow == null || currentStep == null) return;

    const steps = Object.keys(flowConfig[currentFlow]) as AnyStep[];
    const currentStepIndex = steps.indexOf(currentStep);

    if (currentStepIndex > 0) {
      const previousStep = steps[currentStepIndex - 1];
      setCurrentStep(previousStep as AnyStep);
    } else {
      setCurrentFlow(null);
      setCurrentStep(null);
    }
  };

  const getStepIndex = (steps: AnyStep[], currentStep: AnyStep): number => {
    return steps.indexOf(currentStep);
  };

  // Make new Session
  useEffect(() => {
    if (!initialStep) dispatch(signinActions.setSignInSession(defaultSignInSession));
  }, []);

  useEffect(() => {
    if (currentStepIndex > 1) {
      handleDoubleTapEscape();
    }
  }, [activeLocation]);

  useLayoutEffect(() => {
    if (initialFlow) {
      setCurrentFlow(initialFlow);
      if (!initialStep) {
        // Dynamically set the initial step for the initialFlow
        initialStep = Object.keys(flowConfig[initialFlow])[0] as any;
      }
      setCurrentStep(initialStep!);
    }
  }, []);

  // Function to initialize the flow
  const startFlow = (flowType: FlowType) => {
    setCurrentFlow(flowType);
    if (!initialStep) {
      // Dynamically set the initial step based on the flowType
      const initialStep: AnyStep = Object.keys(flowConfig[flowType])[0] as AnyStep;
      setCurrentStep(initialStep);
      dispatch(signinActions.setSignInSession(defaultSignInSession));
    }
  };

  const renderCurrentStep = (): ReactElement | null => {
    if (currentFlow == null || currentStep == null) return null;

    const StepComponent = getStepComponent(currentFlow, currentStep, flowConfig);

    if (StepComponent) {
      // This is to stop the case where a rep is backtracking and then step 3 auto navigates them forwards again
      if (currentStep === SignInSteps.Step3) {
        dispatch(signinActions.updateSignInSessionField("navigation_is_backtracking", true));
      }
      return StepComponent ? <StepComponent onPrimary={moveToNextStep} onSecondary={moveToPreviousStep} /> : null;
    }
    // Handle the end of the flow or an invalid step
    return <div>Flow completed or invalid step</div>;
  };

  const getTotalSteps = (flow: FlowType): number => {
    return flow === FlowType.SignIn ? Object.keys(SignInSteps).length : Object.keys(SignOutSteps).length;
  };

  const totalSteps = currentFlow ? getTotalSteps(currentFlow) : 0;
  const currentStepIndex = currentStep ? getStepIndex(Object.values(SignInSteps), currentStep) : 0;

  const buttonStyles = "h-20 w-64";

  return (
    <div className="p-4">
      {currentFlow && (
        <div className="flex items-center justify-between p-3 space-x-4 bg-card text-card-foreground mt-4 mb-4 drop-shadow-lg dark:shadow-none flex-col md:flex-row">
          <div className="flex items-center">
            <span className="text-lg font-bold mr-2">Current Flow:</span>
            <span className="text-ring uppercase text-xl">{flowTypeToPrintTable(currentFlow)}</span>
          </div>
          <Button
            onClick={() => {
              setCurrentFlow(null);
              navigate({ to: "/signin" });
            }}
          >
            Clear Flow
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {currentFlow && (
          <>
            <SignInFlowProgress currentStep={currentStep as AnyStep} flowType={currentFlow} totalSteps={totalSteps}>
              {/* Pass the current step's index and total steps */}
              <div>{`Current Step: ${currentStepIndex + 1} of ${totalSteps}`}</div>
            </SignInFlowProgress>
            <div className="mt-4 lg:mt-0 lg:ml-4 columns-1 ">
              {user && <SigningInUserCard user={user} />}
              <div className="lg:mt-4">{renderCurrentStep()}</div>
            </div>
          </>
        )}

        {!currentFlow && (
          <div className="flex flex-1 items-center justify-center">
            <div className="p-6 space-y-4 w-full rounded-xl shadow-lg bg-card text-card-foreground">
              <div className="flex flex-row space-x-4 justify-center">
                <Button variant="success" className={buttonStyles} onClick={() => startFlow(FlowType.SignIn)}>
                  Start Sign In
                </Button>
                <Button variant="destructive" className={buttonStyles} onClick={() => startFlow(FlowType.SignOut)}>
                  Start Sign Out
                </Button>
                <Button variant="warning" className={buttonStyles} onClick={() => startFlow(FlowType.Enqueue)}>
                  Enqueue User
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
