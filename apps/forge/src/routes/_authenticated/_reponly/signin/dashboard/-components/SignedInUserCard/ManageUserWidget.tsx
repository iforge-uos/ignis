import { InfractionSection } from "@/routes/_authenticated/_reponly/signin/dashboard/-components/SignedInUserCard/InfractionSection.tsx";
import { TrainingSection } from "@/routes/_authenticated/_reponly/signin/dashboard/-components/SignedInUserCard/TrainingSection.tsx";
import type { Location } from "@ignis/types/sign_in.ts";
import { PartialUserWithTeams } from "@ignis/types/users.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/ui/tabs.tsx";
import * as React from "react";
import { TeamManagementSection } from "@/routes/_authenticated/_reponly/signin/dashboard/-components/SignedInUserCard/TeamManagementSection.tsx";
import { useAuth } from "@/components/auth-provider";
import posthog from "posthog-js";

type ManageSections = "Training" | "Infraction" | "Teams";

const ManageSectionList: ManageSections[] = ["Training", "Infraction", "Teams"];

export interface ManageUserWidgetProps {
  user: PartialUserWithTeams;
  location: Location;
  onShiftReps: PartialUserWithTeams[];
}

const sectionHeadings: Record<ManageSections, string> = {
  Training: "User Training",
  Infraction: "Infractions",
  Teams: "Rep Teams",
};

const sectionComponents: Record<ManageSections, (props: ManageUserWidgetProps) => React.ReactElement> = {
  Training: ({ user, location, onShiftReps }) => (
    <TrainingSection user={user} location={location} onShiftReps={onShiftReps} />
  ),
  Infraction: ({ user, location }) => <InfractionSection user={user} location={location} />,
  Teams: ({ user, location, onShiftReps }) => (
    <TeamManagementSection user={user} location={location} onShiftReps={onShiftReps} />
  ),
};

export const ManageUserWidget: React.FC<ManageUserWidgetProps> = ({ user, location, onShiftReps }) => {
  const auth = useAuth();

  const roleNames = auth.user?.roles.map((role) => role.name).filter(Boolean) ?? ["Rep"];

  const sectionPermissions: Record<ManageSections, string> = {
    Training: "Rep",
    Infraction: "Rep",
    Teams: "Admin",
  };

  posthog.onFeatureFlags(() => {
    // feature flags are guaranteed to be available at this point
    if (!posthog.isFeatureEnabled("user-promotion-ui")) {
      sectionPermissions.Teams = "noone";
    }
  });

  function canUserViewSection(roleNames: string[], section: ManageSections): boolean {
    const requiredRole = sectionPermissions[section];
    return roleNames.includes(requiredRole);
  }

  return (
    <>
      <Tabs className="w-full" defaultValue={ManageSectionList[0]}>
        <TabsList className="w-full">
          {ManageSectionList.filter((title) => canUserViewSection(roleNames, title)).map((title) => (
            <TabsTrigger value={title}>{sectionHeadings[title]}</TabsTrigger>
          ))}
        </TabsList>
        {ManageSectionList.filter((title) => canUserViewSection(roleNames, title)).map((title) => (
          <TabsContent className="content-center justify-center" value={title}>
            {sectionComponents[title]({ user: user, location, onShiftReps })}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
};
