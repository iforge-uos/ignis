import { InfractionSection } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/InfractionSection.tsx";
import { TrainingSection } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/TrainingSection.tsx";
import type { Location } from "@ignis/types/sign_in.ts";
import type { PartialUser } from "@ignis/types/users.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/ui/tabs";
import * as React from "react";
import { TeamManagementSection } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/TeamManagementSection.tsx";

type Addable = "Training" | "Infraction" | "Rep";

const ADDABLE: Addable[] = ["Training", "Infraction", "Rep"];

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
  Rep: ({ user, location, onShiftReps }) => (
    // TODO COMPLETE
    <TeamManagementSection user={user} location={location} onShiftReps={onShiftReps} />
  ),
};

export const AddToUser: React.FC<AddToUserProps> = ({ user, location, onShiftReps }) => {
  return (
    <>
      <Tabs className="max-w-2xl min-w-2xl" defaultValue={ADDABLE[0]}>
        <TabsList className="w-full">
          {ADDABLE.map((title) => {
            return <TabsTrigger value={title}>Add {title}</TabsTrigger>;
          })}
        </TabsList>
        {ADDABLE.map((title) => {
          return <TabsContent value={title}>{sectionComponents[title]({ user, location, onShiftReps })}</TabsContent>;
        })}
      </Tabs>
    </>
  );
};
