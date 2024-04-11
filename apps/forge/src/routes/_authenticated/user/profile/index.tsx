import Title from "@/components/title";
import { createFileRoute } from "@tanstack/react-router";

const UserProfilePageComponent = () => {
  return (
    <>
      <Title prompt="Profile" />
      <div className="p-2">
        <h3>USER Profile PAGE</h3>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_authenticated/user/profile/")({
  component: UserProfilePageComponent,
});
