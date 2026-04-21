import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Checkbox } from "@packages/ui/components/checkbox";
import { Label } from "@packages/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@packages/ui/components/radio-group";
import { Separator } from "@packages/ui/components/separator";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import React from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import type { InteractionResponse } from "@/api/training/interact.$interaction_id";
import Title from "@/components/title";
import { TrainingHeader } from "@/components/training/TrainingHeader";
import { orpc } from "@/lib/orpc";
import { ensureQueryData } from "@/lib/query-utils";
import { cn } from "@/lib/utils/cn";

type Section = Extract<InteractionResponse, { __typename: "training::TrainingPage" | "training::Question" }>; // ones we can display

export function TrainingContent({ content, className }: { content: string; className?: string }) {
  return (
    <div id="training-content" className={cn("text-lg", className)}>
      {/* We need special styling for <a> to show it's clickable */}
      <Markdown rehypePlugins={[rehypeRaw, remarkGfm]}>{content}</Markdown>
    </div>
  );
}

const Component: React.FC = () => {
  const { id: sessionId, training } = Route.useLoaderData();

  const ref = React.useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const [buttonName, setButtonName] = React.useState<string>("Next");
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(false);
  const [sections, setSections] = React.useState<Section[]>(training.sections);
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<{ id: string }[]>([]);

  const currentSection = sections.at(-1);
  const progressDurationMs =
    currentSection?.__typename === "training::TrainingPage" ? (currentSection.duration?.total("milliseconds") ?? 0) : 0;
  const isTimedPageVisible =
    currentSection?.__typename === "training::TrainingPage" &&
    buttonDisabled &&
    remainingSeconds !== null &&
    remainingSeconds > 0;

  React.useEffect(() => {
    if (!isTimedPageVisible) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds === null) return null;
        if (seconds <= 1) {
          setButtonDisabled(false);
          setButtonName("Next");
          return null;
        }

        const updatedSeconds = seconds - 1;
        setButtonName(`Remaining - ${updatedSeconds}s`);
        return updatedSeconds;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTimedPageVisible]);

  React.useEffect(() => {
    if (currentSection?.__typename !== "training::TrainingPage") {
      setButtonDisabled(false);
      setButtonName("Next");
      setRemainingSeconds(null);
      return;
    }

    const seconds = currentSection.duration?.total("seconds");
    if (!seconds) {
      setButtonDisabled(false);
      setButtonName("Next");
      setRemainingSeconds(null);
      return;
    }

    setButtonDisabled(true);
    setRemainingSeconds(seconds);
    setButtonName(`Remaining - ${seconds}s`);
  }, [currentSection]);

  const interactWithTraining = async () => {
    let section: NonNullable<InteractionResponse>;
    if (!sessionId) {
      section = sections.at(-1)!;
    } else {
      const currentSection = sections!.at(-1)!;
      const section_ = await orpc.training.interact.call({
        interaction_id: currentSection.id,
        session_id: sessionId,
        answers: currentSection.__typename === "training::Question" ? answers : undefined,
      });
      if (!section_) {
        return navigate({ to: "/training/finished" });
      }
      section = section_;

      if (section.__typename === "training::WrongAnswers") {
        return alert("Wrong answers"); // FIXME better handling
      }
      setSections((sections) => [...sections, section as Section]);
      setAnswers([]);
    }
  };

  return (
    <>
      <Title prompt={`${training.name} Training`} />
      <style>{`
        @keyframes training-timed-progress {
          from {
            transform: translateX(0%);
          }

          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
      <div className="w-full py-6 space-y-4">
        <div className="container space-y-4 px-4 md:px-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-center">{training.name}</h1>
            <TrainingHeader data={training} />
            <Separator />
            <br />
            <TrainingContent content={training.description} />
            <br />
            {sections.map((section, idx) => (
              <div key={section.id}>
                <Separator />
                <h2 className="text-2xl font-semibold py-3">{(section as any)?.name ?? "Question"}</h2>

                <TrainingContent content={section.content} />
                {section.__typename === "training::Question" &&
                  (section.type === "SINGLE" ? (
                    <RadioGroup>
                      <Badge variant="secondary" className="ml-0.5">
                        Select one
                      </Badge>
                      {section.answers.map((answer) => (
                        <div className="flex items-center space-x-2" key={answer.id}>
                          <RadioGroupItem
                            value={answer.id}
                            id={answer.id}
                            disabled={idx !== sections.length - 1}
                            className="rounded-lg"
                            onClick={() => setAnswers([answer])}
                          />
                          <Label htmlFor={answer.id} className="hover:cursor-pointer">
                            <TrainingContent content={answer.content} />
                          </Label>
                          {answer.description && ( // TODO think about how to show these
                            <>
                              <br />
                              <TrainingContent content={answer.description} />
                            </>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <>
                      <Badge variant="secondary" className="ml-0.5">
                        Select multiple
                      </Badge>
                      {section.answers.map((answer) => (
                        <div className="flex items-center space-x-2" key={answer.id}>
                          <Checkbox
                            value={answer.id}
                            id={answer.id}
                            disabled={idx !== sections.length - 1}
                            onCheckedChange={() => {
                              setAnswers((prevState) => {
                                return prevState.includes(answer)
                                  ? prevState.filter((answer_) => answer_ !== answer)
                                  : [...prevState, answer];
                              });
                            }}
                          />
                          <Label htmlFor={answer.id} className="hover:cursor-pointer">
                            <TrainingContent content={answer.content} />
                          </Label>
                        </div>
                      ))}
                    </>
                  ))}
                <br />
              </div>
            ))}
            <Button
              className="fixed bottom-15 right-8"
              onClick={() => ref.current?.scrollIntoView({ behavior: "smooth" })}
            >
              <ArrowDown className="pr-2" />
              To bottom of page
            </Button>
          </div>
          <Separator />
        </div>
        <div className="p-4 md:p-6">
          <div className="container">
            <Button
              // if we're on a training page it doesn't matter if answers aren't selected
              disabled={
                ["training::TrainingPage", undefined].includes(sections.at(-1)?.__typename)
                  ? buttonDisabled
                  : answers.length === 0
              }
              className="w-full h-12 rounded-md flex flex-col items-center justify-center"
              onClick={interactWithTraining}
              ref={ref}
            >
              <div>{buttonName}</div>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                hidden={!isTimedPageVisible}
                className="bg-primary/20 relative overflow-hidden w-full rounded-md h-1 m-1"
                style={
                  progressDurationMs > 0
                    ? ({ "--timed-progress-ms": `${progressDurationMs}ms` } as React.CSSProperties)
                    : undefined
                }
              >
                <div
                  className="bg-slate-50 h-full w-full"
                  style={
                    isTimedPageVisible
                      ? {
                          transform: "translateX(0%)",
                          animation: "training-timed-progress var(--timed-progress-ms) linear forwards",
                        }
                      : { transform: "translateX(-100%)" }
                  }
                />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/training/$id")({
  loader: async ({ context, params }) =>
    await ensureQueryData(context.queryClient, orpc.training.start.queryOptions({ input: params })),
  component: Component,
});
