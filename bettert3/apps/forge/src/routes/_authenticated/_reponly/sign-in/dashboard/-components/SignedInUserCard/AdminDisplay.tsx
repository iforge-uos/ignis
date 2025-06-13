import { USER_EMAIL_DOMAIN } from "@/lib/utils/constants";
import { PartialUserWithTeams } from "@packages/types/users";
import { Badge } from "@packages/ui/components/badge";
import * as React from "react";

interface AdminDisplayProps {
  user: PartialUserWithTeams;
}

export const AdminDisplay: React.FC<AdminDisplayProps> = ({ user }) => {
  return (
    <div className="flex mb-4 items-center rounded-sm justify-between w-full flex-col gap-2 border-2 border-accent/40 dark:border-accent/20 border-dashed p-2 ">
      <div className="gap-2 flex">
        <Badge variant="outline" className="rounded-sm shadow-md flex-col">
          <span className="text-accent-foreground">UCard Number</span> <span>XXX-{user.ucard_number}</span>
        </Badge>
        <Badge variant="outline" className="rounded-sm shadow-md flex-col">
          <span className="text-accent-foreground">Username</span> <span>{user.username}</span>
        </Badge>
      </div>
      <Badge variant="outline" className="rounded-sm shadow-md flex-col">
        <span className="text-accent-foreground">Email</span>{" "}
        <span>
          {user.email}@{USER_EMAIL_DOMAIN}
        </span>
      </Badge>
    </div>
  );
};
