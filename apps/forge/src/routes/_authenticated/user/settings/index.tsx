import { createFileRoute } from "@tanstack/react-router"
import Title from "@/components/title";
import { RouteUnfinished } from "@/components/routing/RouteUnfinished";

const UserSettingsPageComponent = () => {
  return (
    <>
      <Title prompt="Settings" />
      <div className="p-2">
        <h3>USER SETTINGS PAGE</h3>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/user/settings/")({ component: RouteUnfinished });
