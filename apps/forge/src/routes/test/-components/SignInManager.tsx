import {
  activeLocationAtom,
  resetSessionAtom,
  sessionAtom,
  sessionNavigationBacktrackingAtom,
  sessionUserAtom,
} from "@/atoms/signInAppAtoms";
import useDoubleTapEscape from "@/hooks/useDoubleTapEscape";
import QueueDispatcher from "@/routes/_authenticated/_reponly/sign-in/actions/-components/QueueDispatcher";
import SignInDispatcher from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInDispatcher";
import SignInFlowProgress from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInFlowProgress";
import SignInReasonInput from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignInReasonInput";
import SignOutDispatcher from "@/routes/_authenticated/_reponly/sign-in/actions/-components/SignOutDispatcher";
import ToolSelectionInput from "@/routes/_authenticated/_reponly/sign-in/actions/-components/ToolSelectionInput";
import UCardInput from "@/routes/_authenticated/_reponly/sign-in/actions/-components/UCardInput";
import {
  AnyStep,
  EnqueueSteps,
  FlowConfiguration,
  FlowStepComponent,
  FlowType,
  SignInSteps,
  SignOutSteps,
  flowTypeToPrintTable,
} from "@/types/signInActions";
import { SignInSession } from "@/types/sign_in";
import { Button } from "@packages/ui/components/button";
import { useNavigate } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { ReactElement, useEffect, useLayoutEffect, useState } from "react";
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
  currentStep: SignInSteps | SignOutSteps | EnqueueSteps,
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

export default function SignInActionsManager<FlowT extends FlowType | undefined = undefined>({
  initialFlow,
  initialStep,
}: SignInManagerProps<FlowT>): React.ReactElement {
  const [currentFlow, setCurrentFlow] = useState<FlowType | null>(null);
  const [currentStep, setCurrentStep] = useState<AnyStep | null>(null);
  const activeLocation = useAtomValue(activeLocationAtom);
  const user = useAtomValue(sessionUserAtom);
  const [, setSession] = useAtom(sessionAtom);
  const resetSession = useSetAtom(resetSessionAtom);
  const [, setNavigationBacktracking] = useAtom(sessionNavigationBacktrackingAtom);

  const navigate = useNavigate();

  const handleDoubleTapEscape = () => {
    setCurrentFlow(null);
    setCurrentStep(null);
    resetSession();
  };

  useDoubleTapEscape(handleDoubleTapEscape);

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
    if (!initialStep) setSession(defaultSignInSession);
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
        initialStep = Object.keys(flowConfig[initialFlow])[0] as any;
      }
      setCurrentStep(initialStep!);
    }
  }, []);

  const startFlow = (flowType: FlowType) => {
    setCurrentFlow(flowType);
    if (!initialStep) {
      const initialStep: AnyStep = Object.keys(flowConfig[flowType])[0] as AnyStep;
      setCurrentStep(initialStep);
      setSession(defaultSignInSession);
    }
  };

  const renderCurrentStep = (): ReactElement | null => {
    if (currentFlow == null || currentStep == null) return null;

    const StepComponent = getStepComponent(currentFlow, currentStep, flowConfig);

    if (StepComponent) {
      if (currentStep === SignInSteps.Step3) {
        setNavigationBacktracking(true);
      }
      return StepComponent ? <StepComponent onPrimary={moveToNextStep} onSecondary={moveToPreviousStep} /> : null;
    }
    return <div>Flow completed or invalid step</div>;
  };

  const getTotalSteps = (flow: FlowType): number => {
    return flow === FlowType.SignIn ? Object.keys(SignInSteps).length : Object.keys(SignOutSteps).length;
  };

  const totalSteps = currentFlow ? getTotalSteps(currentFlow) : 0;
  const currentStepIndex = currentStep ? getStepIndex(Object.values(SignInSteps), currentStep) : 0;

  const buttonStyles = "h-16 w-full sm:h-20 sm:w-64";

  return (
    <div className="p-2 sm:p-4">
      {currentFlow && (
        <div className="flex items-center justify-between p-2 sm:p-3 space-y-2 sm:space-y-0 space-x-0 sm:space-x-4 bg-card text-card-foreground mt-2 sm:mt-4 mb-2 sm:mb-4 drop-shadow-lg dark:shadow-none flex-col sm:flex-row">
          <div className="flex items-center">
            <span className="text-base sm:text-lg font-bold mr-2">Current Flow:</span>
            <span className="text-ring uppercase text-lg sm:text-xl">{flowTypeToPrintTable(currentFlow)}</span>
          </div>
          <Button
            onClick={async () => {
              setCurrentFlow(null);
              await navigate({ to: "/sign-in" });
            }}
            className="w-full sm:w-auto"
          >
            Clear Flow
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {currentFlow && (
          <>
            <SignInFlowProgress
              currentStep={currentStep as AnyStep}
              flowType={currentFlow}
              totalSteps={totalSteps}
              className="w-full lg:w-auto"
            >
              <div className="text-sm sm:text-base">{`Current Step: ${currentStepIndex + 1} of ${totalSteps}`}</div>
            </SignInFlowProgress>
            <div className="mt-4 lg:mt-0 lg:ml-4 w-full">
              {user && <SigningInUserCard user={user} className="w-full" />}
              <div className="mt-4 w-full">{renderCurrentStep()}</div>
            </div>
          </>
        )}

        {!currentFlow && (
          <div className="flex flex-1 items-center justify-center w-full">
            <div className="p-3 sm:p-6 space-y-4 w-full rounded-xl shadow-lg bg-card text-card-foreground">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
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
