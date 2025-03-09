import Title from "@/components/title";
import { TrainingHeader } from "@/components/training/TrainingHeader";
import { TrainingForTags, deserializeMd } from "@/lib/utils";
import { get } from "@/services/training/get";
import { LocationName, Section, Training } from "@ignis/types/training";
import { createFileRoute, deepEqual } from "@tanstack/react-router";
import { PlateEditor } from "@ui/components/plate-ui/plate-editor";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Separator } from "@ui/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { EyeIcon, EyeOffIcon, HourglassIcon, InfoIcon, PlusIcon, TrashIcon } from "lucide-react";
import React from "react";

function Component() {
  const { id } = Route.useParams();
  const originalData = Route.useLoaderData();
  const [data, setData] = React.useState<Training>(JSON.parse(JSON.stringify(originalData)));
  const [locations, setLocations] = React.useState<LocationName[]>(data.locations);
  const [sections, setSections] = React.useState(data.sections!);
  const [tags, setTags] = React.useState<TrainingForTags>(data);
  console.log("data", data, "orig", originalData);

  const updateSection = <KeyT extends keyof Section>(idx: number, key: KeyT, value: Section[KeyT]) => {
    const updatedSections = [...sections];
    updatedSections[idx][key] = value;
    setSections(updatedSections);
  };
  React.useEffect(() => {
    setData((data) => ({ ...data, tags }));
  }, [tags]);

  return (
    <>
      <Title prompt={`Editing ${data.name} Training`} />
      <div className="w-full py-6 space-y-4">
        <div className="container space-y-4 px-4 md:px-6">
          <div className="space-y-2">
            <Input
              className="text-4xl font-bold text-center h-12"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
            <TrainingHeader
              data={data}
              editing
              tags={tags}
              setTags={setTags}
              locations={locations}
              setLocations={setLocations}
            />
            <div className="flex gap-2 items-center mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="hover:cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  Shown on various places around the website, ideally should be relatively short
                </TooltipContent>
              </Tooltip>
              <h2 className="text-2xl font-semibold">Description:</h2>
            </div>
            <PlateEditor
              className="z--10 text-lg"
              toolbarClassName="z--10"
              placeholder="Enter the training's description."
              initialValue={deserializeMd(data.description)}
            />
            {sections.map((section, idx) => (
              // TODO Draggable
              <div key={section.index}>
                <Separator />
                <div className="flex">
                  <div className="grid-cols-2 flex w-full mt-2">
                    <div className="flex flex-col w-full">
                      <div className="flex border border-input rounded-tl-md">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5  text-2xl font-semibold min-w-10 ${section.enabled ? "" : "opacity-50 border-opacity-50"}`}
                        >
                          {section.index + 1}.
                        </div>
                        <Input
                          className="flex justify-between text-2xl font-semibold border-none rounded-none relative z-10 focus:z-20 focus:ring-2 p--1"
                          type="text"
                          placeholder="Section Name"
                          disabled={!section.enabled}
                          readOnly={!(section as any)?.name === undefined}
                          value={(section as any)?.name ?? "Question"}
                          // @ts-expect-error: name isn't really valid in the union but since questions are readonly this is fine
                          onChange={(e) => updateSection(idx, "name", e.target.value)}
                          required={true}
                        />
                      </div>
                      <PlateEditor
                        className="text-lg rounded-none rounded-bl-md relative z-10 focus:z-20 focus:ring-2 w-full min-h-48"
                        initialValue={deserializeMd(section.content)}
                        editorProps={{ disabled: !section.enabled }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="rounded-none rounded-tr-md h-full"
                            onClick={() => updateSection(idx, "enabled", !section.enabled)}
                          >
                            {section.enabled ? <EyeIcon /> : <EyeOffIcon />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{section.enabled ? "Hide" : "Unhide"} Section</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="success"
                            className="rounded-none h-full"
                            onClick={() => {
                              setSections([
                                ...sections.slice(0, idx + 1),
                                {
                                  content: "",
                                  enabled: true,
                                  index: idx + 1,
                                  type_name: "training::TrainingPage", // if the content contains a Checkbox or a RadioGroup it goes to a Question
                                  name: "",
                                  id: null as never as string, // we can't have an ID till it's committed to DB TODO idk how this actually works when we go to display them
                                },
                                ...sections.slice(idx + 1).map((section) => ({
                                  ...section,
                                  index: section.index + 1,
                                })),
                              ]);
                            }}
                          >
                            <PlusIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add new section below</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="info"
                            className="rounded-none h-full"
                            disabled={section.type_name === "training::Question"}
                          >
                            <HourglassIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Adjust the amount of time the page must be viewed for</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            className="rounded-none rounded-br-md h-full"
                            onClick={() => {
                              if (confirm("Delete this section?")) {
                                setSections(sections.filter((_, idx_) => idx !== idx_));
                              }
                            }}
                          >
                            <TrashIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete section</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                {/* <div className="hover:cursor-pointer h-2 flex items-center"><Separator /></div> */}
                {/* {section.type_name === "training::Question" &&
                  (section.type === "SINGLE" ? (
                    <RadioGroup>
                      {section.answers.map((answer) => (
                        <div className="flex items-center space-x-2" key={answer.id}>
                          <RadioGroupItem value={answer.id} id={answer.id} className="rounded-lg" />
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
                        <Checkbox value={answer.id} id={answer.id} />
                        <Label className="hover:cursor-pointer">{answer.content}</Label>
                      </div>
                    ))
                  ))} */}
              </div>
            ))}
          </div>
          <Separator className="h-0.5" />
          <div className="flex justify-between">
            <Button
              className="w-full rounded-none rounded-l-md"
              variant="success"
              disabled={deepEqual(originalData, data, true)} // TODO no idea why this doesn't work
            >
              Save
            </Button>
            <Button className="w-full rounded-none rounded-r-md" variant="info">
              View as user
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/_reponly/training/$id/edit")({
  component: Component,
  loader: async ({ params }) => await get(params.id, { editing: true }),
  // onLeave: () => saveSession  // Should also be doing this every time a change is made? maybe put in cache IDK
});
