import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { Badge } from "@packages/ui/components/badge";
import { Card } from "@packages/ui/components/card";
import { Link } from "@tanstack/react-router";
import { Accessibility } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { UserAvatar } from "/src/components/avatar";
import { TeamIcon } from "/src/icons/Team";
import { SignInUser } from "/src/lib/utils/queries";


interface SigningInUserCardProps {
  user: SignInUser;
  showAccessibilityNotes?: boolean; 
  className?: string; // Define optional className prop
}

export default function SigningInUserCard({ user, showAccessibilityNotes = false, className }: SigningInUserCardProps) {
  return (
    <Card className={cn("bg-card p-4 rounded-sm flex flex-col justify-between text-black dark:text-white", className)}>
      <div className="m-5">
        <div className="flex items-center justify-between w-full space-x-2">
          <div className="w-2/3 p-1 flex-col">
            <Link to="/users/$id" params={user}>
              <h2 className="text-center text-lg font-bold hover:underline underline-offset-4">{user.display_name}</h2>
            </Link>
            <div>
              {user.__typename === "users::Rep" && user.teams.map((team) => (
                <Badge
                  key={team.name}
                  variant="team"
                  className="flex items-center justify-start rounded-sm pt-1.5 pb-1.5 mt-2"
                >
                  <div className="flex gap-1 w-full text-center">
                    <TeamIcon team={team.name} className="stroke-black dark:stroke-white mr-1 h-4 w-4" />
                    <p className="w-full text-xs">{team.name}</p>
                  </div>
                </Badge>
              ))}
            </div>
          </div>
          <UserAvatar user={user} className="size-25 aspect-square" />
        </div>
      </div>
      {showAccessibilityNotes && user.accessibility_notes.length > 0 && (
        <Alert variant="info" className="mx-5 mb-5 w-auto">
          <Accessibility />
          <AlertTitle className="font-bold">Accessibility needs</AlertTitle>
          <AlertDescription className="text-current">
            {user.accessibility_notes.map((note) => (
              <p key={note.id} className="whitespace-pre-wrap">
                {note.content}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
      </Card>
  );
}
