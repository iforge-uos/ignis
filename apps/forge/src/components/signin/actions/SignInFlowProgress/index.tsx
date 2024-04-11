import React from "react";
import {Timeline, TimelineItem} from "@ui/components/ui/timeline.tsx";
import {Card, CardContent, CardHeader} from "@ui/components/ui/card.tsx";
import {
    AnyStep,
    EnqueueSteps,
    FlowType, RegisterSteps,
    SignInSteps,
    SignOutSteps,
} from "@/components/signin/actions/SignInManager/types.ts";

interface SignInProgressProps {
    currentStep: AnyStep;
    flowType: FlowType;
    totalSteps: number;
    children: React.ReactNode;
}

const SignInFlowProgress: React.FC<SignInProgressProps> = ({currentStep, flowType}) => {
    let stepTitles: string[] = [];

    switch (flowType) {
        case FlowType.SignIn:
            stepTitles = Object.values(SignInSteps);
            break;
        case FlowType.SignOut:
            stepTitles = Object.values(SignOutSteps);
            break;
        case FlowType.Register:
            stepTitles = Object.values(RegisterSteps);
            break;
        case FlowType.Enqueue:
            stepTitles = Object.values(EnqueueSteps);
            break;
        default:
            console.warn(`Unsupported flowType: ${flowType}`);
            break;
    }

    const currentStepIndex = stepTitles.indexOf(currentStep as string);

    return (
        <Card className="w-[250px]">
            <CardHeader className='flex items-center justify-center'>
                <h3 className="text-lg font-bold">{'Progress'}</h3>
            </CardHeader>
            <CardContent>
                <Timeline orientation='vertical' currentStepIndex={currentStepIndex}>
                    {stepTitles.map((stepTitle, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <TimelineItem key={stepTitle} isCompleted={isCompleted} isCurrent={isCurrent}>
                                {stepTitle}
                            </TimelineItem>
                        );
                    })}
                </Timeline>
            </CardContent>
        </Card>
    );
};

export default SignInFlowProgress;
