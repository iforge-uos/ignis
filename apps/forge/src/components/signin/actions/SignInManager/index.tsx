import React, {ReactElement, useEffect, useLayoutEffect, useState} from "react";
import UCardInput from "@/components/signin/actions/UCardInput";
import SignInReasonInput from "@/components/signin/actions/SignInReasonInput";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppRootState} from "@/redux/store.ts";
import {signinActions} from "@/redux/signin/signin.slice.ts";
import {SignInSession} from "@/redux/signin/signin.types.ts";
import {
    AnyStep, EnqueueSteps, FlowConfiguration, FlowStepComponent,
    FlowType,
    flowTypeToPrintTable, RegisterSteps,
    SignInSteps,
    SignOutSteps
} from "@/components/signin/actions/SignInManager/types";
import {Separator} from "@ui/components/ui/separator"
import ToolSelectionInput from "@/components/signin/actions/ToolSelectionInput";
import SignInDispatcher from "@/components/signin/actions/SignInDispatcher";
import SignOutDispatcher from "@/components/signin/actions/SignOutDispatcher";
import SignInFlowProgress from "@/components/signin/actions/SignInFlowProgress";
import {Button} from "@ui/components/ui/button.tsx";
import useDoubleTapEscape from "@/components/signin/actions/SignInManager/useDoubleTapEscape.ts";
import QueueDispatcher from "@/components/signin/actions/QueueDispatcher";
import RegisterDispatcher from "@/components/signin/actions/RegisterDispatcher";
import SignInRegisterForm from "@/components/signin/actions/SignInRegisterForm";

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
    [FlowType.Register]: {
        [RegisterSteps.Step1]: UCardInput,
        [RegisterSteps.Step2]: SignInRegisterForm,
        [RegisterSteps.Step3]: RegisterDispatcher,
    },
    [FlowType.Enqueue]: {
        [EnqueueSteps.Step1]: UCardInput,
        [EnqueueSteps.Step2]: QueueDispatcher,
    }
};

const defaultSignInSession: SignInSession = {
    ucard_number: 0,
    is_rep: false,
    sign_in_reason: null,
    training: null,
    navigation_is_backtracking: false,
    session_errored: false,
    username: null,
}

interface SignInManagerProps {
    initialFlow?: FlowType;
}

export const getStepComponent = (
    currentFlow: FlowType,
    currentStep: SignInSteps | SignOutSteps | RegisterSteps | EnqueueSteps,
    flowConfig: FlowConfiguration
): FlowStepComponent => {
    switch (currentFlow) {
        case FlowType.SignIn:
            return flowConfig[currentFlow][currentStep as SignInSteps];
        case FlowType.SignOut:
            return flowConfig[currentFlow][currentStep as SignOutSteps];
        case FlowType.Register:
            return flowConfig[currentFlow][currentStep as RegisterSteps];
        case FlowType.Enqueue:
            return flowConfig[currentFlow][currentStep as EnqueueSteps];
        default:
            throw new Error(`Unsupported flow type: ${currentFlow}`);
    }
};

// SignInActionsManager Component
const SignInActionsManager: React.FC<SignInManagerProps> = ({initialFlow}) => {
    const [currentFlow, setCurrentFlow] = useState<FlowType | null>(null);
    const [currentStep, setCurrentStep] = useState<AnyStep | null>(null);
    const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);

    const dispatch = useDispatch<AppDispatch>();

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
        dispatch(signinActions.setSignInSession(defaultSignInSession))
    }, []);

    useEffect(() => {
        if (currentStepIndex > 1) {
            handleDoubleTapEscape();
        }
    }, [activeLocation]);

    useLayoutEffect(() => {
        if (initialFlow) {
            setCurrentFlow(initialFlow);
            // Dynamically set the initial step for the initialFlow
            const initialStep = Object.keys(flowConfig[initialFlow])[0] as AnyStep;
            setCurrentStep(initialStep);
        }
    }, [initialFlow]);


    // Function to initialize the flow
    const startFlow = (flowType: FlowType) => {
        setCurrentFlow(flowType);
        // Dynamically set the initial step based on the flowType
        const initialStep = Object.keys(flowConfig[flowType])[0] as AnyStep;
        setCurrentStep(initialStep);
        dispatch(signinActions.setSignInSession(defaultSignInSession));
    };


    const renderCurrentStep = (): ReactElement | null => {
        if (currentFlow == null || currentStep == null) return null;


        const StepComponent = getStepComponent(currentFlow, currentStep, flowConfig)

        if (StepComponent) {
            // This is to stop the case where a rep is backtracking and then step 3 auto navigates them forwards again
            if (currentStep == SignInSteps.Step3) {
                dispatch(signinActions.updateSignInSessionField("navigation_is_backtracking", true));
            }
            return StepComponent ? <StepComponent onPrimary={moveToNextStep} onSecondary={moveToPreviousStep}/> : null
        } else {
            // Handle the end of the flow or an invalid step
            return <div>Flow completed or invalid step</div>;
        }
    };

    const getTotalSteps = (flow: FlowType): number => {
        return flow === FlowType.SignIn ? Object.keys(SignInSteps).length : Object.keys(SignOutSteps).length;
    };

    const totalSteps = currentFlow ? getTotalSteps(currentFlow) : 0;
    const currentStepIndex = currentStep ? getStepIndex(Object.values(SignInSteps), currentStep) : 0;


    return (
        <div className="border-2 p-4">
            <h1 className="text-xl font-bold mb-4 text-center">Sign In Actions</h1>
            {currentFlow && (<div
                className="flex items-center justify-between p-3 space-x-4 bg-navbar text-navbar-foreground mt-4 mb-4 drop-shadow-lg dark:shadow-none flex-col md:flex-row">
                <div className="flex items-center">
                    <span className="text-lg font-bold mr-2">Current Flow:</span>
                    <span className="text-ring uppercase text-xl">{flowTypeToPrintTable(currentFlow)}</span>
                </div>
                <Button onClick={() => setCurrentFlow(null)}>Clear Flow</Button>
            </div>)}

            <div className="flex flex-row">
                {currentFlow && (
                    <>
                        <SignInFlowProgress currentStep={currentStep as AnyStep} flowType={currentFlow}
                                            totalSteps={totalSteps}>
                            {/* Pass the current step's index and total steps */}
                            <div>{`Current Step: ${currentStepIndex + 1} of ${totalSteps}`}</div>
                        </SignInFlowProgress>
                        <Separator className='ml-2 mr-2' orientation="vertical"/>
                        <div className="ml-4">{renderCurrentStep()}</div>
                    </>
                )}

                {!currentFlow && (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="p-6 space-y-4 w-full max-w-2xl  rounded-xl shadow-lg">
                            <div className="grid grid-cols-2 gap-10">
                                <Button variant="default" className="h-20" onClick={() => startFlow(FlowType.SignIn)}>
                                    Start Sign In
                                </Button>
                                <Button variant="secondary" className="h-20"
                                        onClick={() => startFlow(FlowType.SignOut)}>
                                    Start Sign Out
                                </Button>
                                <Button variant="outline" className="h-20"
                                        onClick={() => startFlow(FlowType.Register)}>
                                    Start Register
                                </Button>
                                <Button variant="outline" className="h-20"
                                        onClick={() => startFlow(FlowType.Enqueue)}>
                                    Enqueue User
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignInActionsManager;
