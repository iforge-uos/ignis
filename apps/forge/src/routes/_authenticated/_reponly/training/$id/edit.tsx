import Title from "@/components/title";
import { TrainingHeader } from "@/components/training/TrainingHeader";
import { TrainingForTags, deserializeMd, extractError } from "@/lib/utils";
import { TrainingContent } from "@/routes/_authenticated/training/$id";
import { get } from "@/services/training/get";
import { Location } from "@ignis/types/training";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import MultipleSelector, { Option } from "@ui/components/multi-select";
import { Checkbox } from "@ui/components/plate-ui/checkbox";
import { PlateEditor } from "@ui/components/plate-ui/plate-editor";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert";
import { badgeVariants } from "@ui/components/ui/badge";
import { Label } from "@ui/components/ui/label";
import { Loader } from "@ui/components/ui/loader.tsx";
import { RadioGroup } from "@ui/components/ui/radio-group";
import { RadioGroupItem } from "@ui/components/ui/radio-group";
import { Separator } from "@ui/components/ui/separator";
import { Textarea } from "@ui/components/ui/textarea";
import axios from "axios";
import React from "react";

function Component() {
  const { id } = Route.useParams();
  console.log("loading", id);
  const [tags, setTags] = React.useState<TrainingForTags>() as [
    TrainingForTags,
    React.Dispatch<React.SetStateAction<TrainingForTags>>,
  ];
  const [locations, setLocations] = React.useState<Location[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getTraining", id],
    queryFn: () => get(id, { editing: true }),
  });

  React.useEffect(() => {
    if (data) {
      setLocations(data.locations);
      setTags(data);
    }
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }
  if (error instanceof axios.AxiosError && error.response?.status === 404) {
    throw notFound();
  }
  if (error || !data || !locations || !tags) {
    return (
      <>
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error <br />
            {extractError(error!)}
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <Title prompt={`Editing ${data.name} Training`} />
      <div className="w-full py-6 space-y-4">
        <div className="container space-y-4 px-4 md:px-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-center">{data.name}</h1>
            <TrainingHeader
              data={data}
              editing
              tags={tags}
              setTags={setTags}
              locations={locations}
              setLocations={setLocations}
            />
            <h2 className="text-2xl font-semibold mb-2">Description:</h2>
            <PlateEditor // TODO one toolbar for whole instance becase is annoying scroll behave
              className="z--10 text-lg"
              toolbarClassName="z--10"
              placeholder="Enter the training's description."
              initialValue={deserializeMd(data.description)}
            />
            {data.sections?.map((section) => (
              <div key={section.id}>
                <Separator />
                {/* todo should be Textarea or something */}
                {/*readOnly={!(section as any)?.name}*/}
                <div className="text-2xl font-semibold py-3 px-5">{(section as any)?.name ?? "Question"}</div>
                <PlateEditor
                  className="z--10 text-lg"
                  toolbarClassName="z--10"
                  initialValue={deserializeMd(section.content)}
                />
                {(() => {
                  console.log(section);
                  return true;
                })() &&
                  section.type_name === "training::Question" &&
                  (section.type === "SINGLE" ? (
                    <RadioGroup>
                      {section.answers.map((answer) => (
                        <div className="flex items-center space-x-2" key={answer.id}>
                          <RadioGroupItem
                            value={answer.id}
                            id={answer.id}
                            // disabled={idx !== sections.length - 1}
                            className="rounded-lg"
                            // onClick={() => setAnswers([answer])}
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
                          // disabled={idx !== sections.length - 1}
                          // onCheckedChange={() => {
                          //   setAnswers((prevState) => {
                          //     return prevState.includes(answer)
                          //       ? prevState.filter((answer_) => answer_ !== answer)
                          //       : [...prevState, answer];
                          //   });
                          // }}
                        />
                        <Label className="hover:cursor-pointer">{answer.content}</Label>
                      </div>
                    ))
                  ))}
                <br />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/_reponly/training/$id/edit")({
  component: Component,
});
