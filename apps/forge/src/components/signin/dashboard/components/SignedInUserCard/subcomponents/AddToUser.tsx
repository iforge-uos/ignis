import type { PartialUser } from "@ignis/types/users.ts";
import type { Location } from "@ignis/types/sign_in.ts";
import * as React from "react";
import { TrainingSection } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/TrainingSection.tsx";
import { InfractionSection } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/InfractionSection.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Separator } from "@ui/components/ui/separator.tsx";

type Addable = "Training" | "Infraction";

const ADDABLE: Addable[] = ["Training", "Infraction"];
const SECTION_DESCRIPTION = {
  Training: "Add a new training entry to a user's profile.",
  Infraction: "Add an infraction record to a user's profile.",
};

export interface AddToUserProps {
  user: PartialUser;
  location: Location;
  onShiftReps: PartialUser[];
}

const sectionComponents: Record<Addable, (props: AddToUserProps) => React.ReactElement> = {
  Training: ({ user, location, onShiftReps }) => (
    <TrainingSection user={user} location={location} onShiftReps={onShiftReps} />
  ),
  Infraction: ({ user, location, onShiftReps }) => (
    <InfractionSection user={user} location={location} onShiftReps={onShiftReps} />
  ),
};

export const AddToUser: React.FC<AddToUserProps> = ({ user, location, onShiftReps }) => {
  const [section, setSection] = React.useState<Addable>("Training");

  if (!sectionComponents[section]) {
    throw Error("unreachable");
  }

  return (
    <>
      <div className="rounded-sm flex mb-2">
        {ADDABLE.map((title, idx) => {
          let indexStyle = "rounded-none";
          if (idx === 0) {
            indexStyle = "rounded-none rounded-l-md";
          } else if (idx === ADDABLE.length - 1) {
            indexStyle = "rounded-none rounded-r-md";
          }
          return (
            <Button
              className={`w-full justify-center flex-grow ${indexStyle} ${
                title !== section ? "bg-popover-background" : ""
              }`}
              onClick={() => setSection(title)}
            >
              <text className={`${title === section ? "font-bold" : ""}`}>Add {title}</text>
            </Button>
          );
        })}
      </div>
      <Separator />
      <div className="my-2">{SECTION_DESCRIPTION[section]}</div>
      {sectionComponents[section]({ user, location, onShiftReps })}
    </>
  );
};
