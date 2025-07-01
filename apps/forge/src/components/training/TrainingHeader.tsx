import { LOCATIONS, TRAINING_LOCATIONS } from "@/lib/constants";
import { toTitleCase } from "@/lib/utils";
import { ALL_TAGS, TrainingForTags, serializeTrainingTags, trainingTags } from "@/lib/utils/training";
import { LocationName, Training } from "@packages/types/training";
import { Badge } from "@packages/ui/components/badge";
// import { MultiSelect } from "@packages/ui/components/multi-select";
import { Separator } from "@packages/ui/components/separator";
import { LocationIcon } from "@packages/ui/icons/Locations";
import { format } from "date-fns";
import React from "react";

interface BaseTrainingHeaderProps {
  data: Training;
}

interface TrainingHeaderPropsNonEditing extends BaseTrainingHeaderProps {
  editing?: false | undefined | null;
  tags?: undefined;
  setTags?: undefined;
  locations?: undefined;
  setLocations?: undefined;
}

interface TrainingHeaderPropsEditing extends BaseTrainingHeaderProps {
  editing: true;
  tags: TrainingForTags;
  setTags: React.Dispatch<React.SetStateAction<TrainingForTags>>;
  locations: LocationName[];
  setLocations: React.Dispatch<React.SetStateAction<LocationName[]>>;
}

type TrainingHeaderProps = TrainingHeaderPropsEditing | TrainingHeaderPropsNonEditing;

export function TrainingHeader({ data, editing, tags, setTags, locations, setLocations }: TrainingHeaderProps) {
  return (
    <>
      <div className="space-y-2 flex justify-between">
        <div>
          <div className="flex mb-2 items-center">
            <h2 className="text-2xl font-semibold mb-2">Locations:</h2>
            {editing ? (
              <MultiSelect
                className="ml-2"
                badgeClassName="rounded-md py-2"
                badgeVariant="outline"
                value={locations.map((value) => ({
                  label: <LocationIcon location={value} className="-m-1.5 w-4 mx-0.5" />,
                  value,
                }))}
                onChange={(options) => setLocations(options.map((option) => option.value) as LocationName[])} // TODO option for Rep training link and callback for the value changing to add last section for in-person
                selectFirstItem={false}
                defaultOptions={TRAINING_LOCATIONS.map((value) => ({
                  label: (
                    <div className="flex">
                      <LocationIcon location={value} className="-m-1.5 w-4 mx-0.5" />
                      <div className="ml-1">{toTitleCase(value.replace("_", " "))}</div>
                    </div>
                  ),
                  value,
                }))}
                placeholder="Select training locations..."
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">no results found :(</p>
                }
              />
            ) : (
              data.locations.map((value) => (
                <Badge variant="outline" key={value} className="flex rounded-md py-[14px] gap-2 ml-2">
                  <LocationIcon location={value} className="-m-1.5 w-4 mx-0.5" />
                </Badge>
              ))
            )}
          </div>
          <div className="flex mb-2 items-center">
            <h2 className="text-2xl font-semibold mb-2">Tags:</h2>
            {editing ? (
              <MultiSelect
                className="ml-2"
                badgeClassName="rounded-md py-2 gap-2"
                badgeVariant="outline"
                value={trainingTags(tags).map((tag) => ({ label: tag, value: tag }))}
                onChange={(options) => setTags(serializeTrainingTags(options.map((option) => option.value)))} // TODO option for Rep training link and callback for the value changing to add last section for in-person
                selectFirstItem={false}
                defaultOptions={ALL_TAGS.map((tag) => ({ label: tag, value: tag }))}
                placeholder="Select training flags..."
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">no results found :(</p>
                }
              />
            ) : (
              [
                data.compulsory ? "Compulsory" : undefined,
                data.in_person ? "In-Person Training Required" : undefined,
                data.rep ? undefined : "Rep Training",
              ]
                .filter(Boolean)
                .map((tag) => (
                  <Badge variant="outline" key={tag} className="flex rounded-md py-2 gap-2 ml-2">
                    {tag}
                  </Badge>
                ))
            )}
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex text-2xl mb-2 justify-end items-center">
            <div className="font-semibold">Created:</div>
            <Badge variant="outline" className="flex rounded-md py-2 gap-2 ml-2">
              {format(data.created_at, "PPP")}
            </Badge>
          </div>
          <div className="flex text-2xl mb-2 justify-end">
            <div className="font-semibold">Last Updated:</div>
            <Badge variant="outline" className="flex rounded-md py-2 gap-2 ml-2">
              {format(data.updated_at, "PPP")}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}
