import { UserAvatar } from "@/components/avatar";
import { TeamIcon } from "@/components/icons/Team.tsx";
import { sign_in } from "@ignis/types";
import { Link } from "@tanstack/react-router";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Card } from "@ui/components/ui/card.tsx";

export default function SigningInUserCard({ user }: { user: sign_in.User }) {
  return (
    <Card className="bg-card p-4 rounded-sm flex flex-col justify-between text-black dark:text-white">
      <div className="m-2">
        <div className="flex items-center justify-between  w-full space-x-2">
          <div className="w-2/3 p-1 flex-col">
            <Link to="/users/$id" params={user}>
              <h2 className="text-center text-lg font-bold hover:underline underline-offset-4">{user.display_name}</h2>
            </Link>
            <div>
              {user.teams?.map((team) => (
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
          <UserAvatar user={user} className="w-18 h-18 aspect-square" />
        </div>
      </div>
    </Card>
  );
}
