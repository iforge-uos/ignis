import { InfractionSection } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/InfractionSection";
import { TeamManagementSection } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/TeamManagementSection";
import { TrainingSection } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/TrainingSection";
import type { LocationName } from "@packages/types/sign_in";
import { PartialUserWithTeams } from "@packages/types/users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/components/tabs";
import * as React from "react";
import { useUserRoles } from "@/hooks/useUserRoles";


const ManageSectionList = ["Training", "Infraction", "Teams"] as const;
type ManageSections = typeof ManageSectionList[number];

export interface ManageUserWidgetProps {
  user: PartialUserWithTeams;
  locationName: LocationName;
  onShiftReps: PartialUserWithTeams[];
}

const sectionHeadings: Record<ManageSections, string> = {
  Training: "User Training",
  Infraction: "Infractions",
  Teams: "Rep Teams",
};

const sectionComponents: Record<ManageSections, (props: ManageUserWidgetProps) => React.ReactElement> = {
  Training: ({ user, locationName: location, onShiftReps }) => (
    <TrainingSection user={user} locationName={location} onShiftReps={onShiftReps} />
  ),
  Infraction: ({ user, locationName: location }) => <InfractionSection user={user} locationName={location} />,
  Teams: ({ user, locationName: location, onShiftReps }) => (
    <TeamManagementSection user={user} locationName={location} onShiftReps={onShiftReps} />
  ),
};

export const ManageUserWidget: React.FC<ManageUserWidgetProps> = ({ user, locationName, onShiftReps }) => {
  const roleNames = useUserRoles();

  const sectionPermissions: Record<ManageSections, string> = {
    Training: "Rep",
    Infraction: "Rep",
    Teams: "Admin",
  };

  function canUserViewSection(section: ManageSections): boolean {
    const requiredRole = sectionPermissions[section];
    return roleNames.includes(requiredRole);
  }

  return (
      <Tabs className="w-full" defaultValue={ManageSectionList[0]}>
        <TabsList className="w-full">
          {ManageSectionList.filter(canUserViewSection).map((title) => (
            <TabsTrigger value={title} key={title}>
              {sectionHeadings[title]}
            </TabsTrigger>
          ))}
        </TabsList>
        {ManageSectionList.filter(canUserViewSection).map((title) => (
          <TabsContent className="content-center justify-center" value={title} key={title}>
            {sectionComponents[title]({ user: user, locationName, onShiftReps })}
          </TabsContent>
        ))}
      </Tabs>
  );
};
