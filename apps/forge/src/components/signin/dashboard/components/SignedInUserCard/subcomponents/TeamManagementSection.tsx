import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { AddToUserProps } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/AddToUser.tsx";
import { getTeams } from "@/services/users/getTeams.ts";

export const TeamManagementSection: React.FC<AddToUserProps> = () => {
  const {
    data: teams,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeams(),
  });

  console.log(teams, error, isLoading);

  return (
    <>
      <div className="m-2">
        <p>poop</p>
      </div>
    </>
  );
};
