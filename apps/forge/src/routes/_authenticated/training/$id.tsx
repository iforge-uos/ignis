import axiosInstance from "@/api/axiosInstance";
import Title from "@/components/title";
import { TrainingHeader } from "@/components/training/TrainingHeader";
import { get } from "@/services/training/get";
import type { InteractionResponse, Training } from "@ignis/types/training";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Checkbox } from "@ui/components/ui/checkbox";
import { Label } from "@ui/components/ui/label";
import { Progress } from "@ui/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@ui/components/ui/radio-group";
import { Separator } from "@ui/components/ui/separator";
import React from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const PROGRESS_BAR_SAMPLE_MS = 50;

export function TrainingContent({ content }: { content: string }) {
  return (
    <div id="training-content" className="text-lg">
      {/* We need special styling for <a> to show it's clickable */}
      <Markdown rehypePlugins={[rehypeRaw, remarkGfm]}>{content}</Markdown>
    </div>
  );
}

const Component: React.FC = () => {
  const { id } = Route.useParams();
  const data = Route.useLoaderData();

  const navigate = useNavigate();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [buttonName, setButtonName] = React.useState<string>("Start Training");
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(false);
  const [sections, setSections] = React.useState<NonNullable<Training["sections"]>>([]);
  const [progress, setProgress] = React.useState(0);
  const [_, setDelay] = React.useState<number | null>(null);
  const [duration, setDuration] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<{ id: string }[]>([]);

  React.useEffect(() => {
    const progressUpdater = setInterval(() => {
      if (!duration) return;
      setDelay((oldDelay) => {
        if (oldDelay! <= 0) {
          setButtonDisabled(false);
          setButtonName("Next");
          setProgress(0);
          return null;
        }
        const newDelay = oldDelay! - PROGRESS_BAR_SAMPLE_MS;
        setProgress(100 - (newDelay / duration) * 100);
        if (newDelay % 1000 === 0) {
          setButtonName(`Remaining - ${Math.floor(newDelay / 1000)}s`);
        }
        return newDelay;
      });
    }, PROGRESS_BAR_SAMPLE_MS);

    return () => {
      clearInterval(progressUpdater);
    };
  }, [duration]);

  const interactWithTraining = async (training_id: string) => {
    let section: NonNullable<InteractionResponse>;
    if (!sessionId) {
      const r = await axiosInstance.post<{ id: string; sections: Training["sections"] }>(
        `training/${training_id}/start`,
      );
      if (r.status !== 201) {
        return console.error("Failed to start training");
      }
      setSessionId(r.data.id);
      const sections_ = r.data!.sections!;
      setSections(sections_);
      section = sections_.at(-1)!;
    } else {
      const currentSection = sections!.at(-1)!;
      const r = await axiosInstance.post<InteractionResponse>(`training/interact/${currentSection.id}`, {
        session_id: sessionId,
        answers: currentSection.type_name === "training::Question" ? answers : undefined,
      });
      if (r.status !== 201) {
        return console.error("Failed to start training");
      }
      if (!r.data) {
        return navigate({ to: "/training/finished" });
      }
      section = r.data;

      if (section.type_name === "training::WrongAnswers") {
        return alert("Wrong answers"); // FIXME better handling
      }
      setSections((sections) => {
        sections!.push(section as NonNullable<Training["sections"]>[number]);
        return sections;
      });
      setAnswers([]);
    }

    setButtonName("Next");
    if (section.type_name === "training::TrainingPage") {
      const duration_ = section.duration_ ? Number.parseFloat(section.duration_) * 1000 : null;
      if (duration_) {
        setButtonDisabled(true);
      }
      setDelay(duration_);
      setDuration(duration_);
    }
  };

  return (
    <>
      <Title prompt={`${data.name} Training`} />
      <div className="w-full py-6 space-y-4">
        <div className="container space-y-4 px-4 md:px-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-center">{data.name}</h1>
            <TrainingHeader data={data} />
            <TrainingContent content={data.description} />
            <br />
            {sections.map((section, idx) => (
              <div key={section.id}>
                <Separator />
                <h2 className="text-2xl font-semibold py-3">{(section as any)?.name ?? "Question"}</h2>
                <>
                  <TrainingContent content={section.content} />
                  {section.type_name === "training::Question" &&
                    (section.type === "SINGLE" ? (
                      <RadioGroup>
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
                      section.answers.map((answer) => (
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
                      ))
                    ))}
                  <br />
                </>
              </div>
            ))}
          </div>
          <Separator />
        </div>
        <div className="p-4 md:p-6">
          <div className="container">
            <Button
              // if we're on a training page it doesn't matter if answers aren't selected
              disabled={
                ["training::TrainingPage", undefined].includes(sections.at(-1)?.type_name)
                  ? buttonDisabled
                  : answers.length === 0
              }
              className="w-full h-12 rounded-md flex flex-col items-center justify-center"
              onClick={() => interactWithTraining(id)}
            >
              <div>{buttonName}</div>
              <Progress
                className="w-full rounded-md h-1 m-1"
                indicatorClassName="bg-slate-50"
                value={progress}
                hidden={!progress}
              />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/training/$id")({
  loader: async ({ params }) => await get(params.id),
  component: Component,
});
