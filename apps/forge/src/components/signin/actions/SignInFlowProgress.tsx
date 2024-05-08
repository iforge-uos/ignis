import { AnyStep, EnqueueSteps, FlowType, SignInSteps, SignOutSteps } from "@/types/signInActions.ts";
import { Card, CardContent, CardHeader } from "@ui/components/ui/card.tsx";
import { Timeline, TimelineDot, TimelineHeading, TimelineItem, TimelineLine } from "@ui/components/ui/timeline.tsx";
import React, { useEffect, useState } from "react";

interface SignInProgressProps {
  currentStep: AnyStep;
  flowType: FlowType;
  totalSteps: number;
  children: React.ReactNode;
}

const SWITCH_WIDTH_PX = 1024;

const SignInFlowProgress: React.FC<SignInProgressProps> = ({ currentStep, flowType }) => {
  const [timelineOrientation, setTimelineOrientation] = useState<"vertical" | "horizontal">(
    window.innerWidth >= SWITCH_WIDTH_PX ? "vertical" : "horizontal",
  );
  let stepTitles: string[] = [];

  useEffect(() => {
    const handleResize = () => {
      setTimelineOrientation(window.innerWidth >= SWITCH_WIDTH_PX ? "vertical" : "horizontal");
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  switch (flowType) {
    case FlowType.SignIn:
      stepTitles = Object.values(SignInSteps);
      break;
    case FlowType.SignOut:
      stepTitles = Object.values(SignOutSteps);
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
    <Card>
      <CardHeader className="flex items-center justify-center">
        <h3 className="text-lg font-bold">{"Progress"}</h3>
      </CardHeader>
      <CardContent>
        <Timeline orientation={timelineOrientation}>
          {stepTitles.map((stepTitle, index) => {
            const isCompleted = index < currentStepIndex;
            const status = isCompleted ? "done" : "default";

            return (
              <TimelineItem key={stepTitle} status={status} orientation={timelineOrientation}>
                <TimelineHeading className="uppercase whitespace-nowrap" orientation={timelineOrientation}>
                  {stepTitle}
                </TimelineHeading>
                <TimelineDot orientation={timelineOrientation} status={status} className="rounded-sm" />
                {index < stepTitles.length - 1 && <TimelineLine orientation={timelineOrientation} done={isCompleted} />}
              </TimelineItem>
            );
          })}
        </Timeline>
      </CardContent>
    </Card>
  );
};

export default SignInFlowProgress;
