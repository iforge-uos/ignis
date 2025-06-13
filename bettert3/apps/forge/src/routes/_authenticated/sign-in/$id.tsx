import { UserAvatar } from "@/components/avatar";
import Title from "@/components/title";
import { useUser } from "@/hooks/useUser";
import { orpc } from "@/lib/orpc";
import { toTitleCase } from "@/lib/utils";
import { Badge } from "@packages/ui/components/badge";
import { Button } from "@packages/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Separator } from "@packages/ui/components/separator";
import { LocationIcon } from "@packages/ui/icons//Locations";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, ClockIcon, DrillIcon } from "lucide-react";
import { SignInReason } from "../_reponly/sign-in/actions/-components/SignInReason";
import { AddUserAttributes } from "../_reponly/sign-in/dashboard/-components/SignedInUserCard";

export default function Component() {
  const data = Route.useLoaderData();
  const user = useUser();

  return (
    <div className="container mx-auto py-8">
      <Title prompt={`${data.user.display_name}'s Sign In`} />
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <UserAvatar user={data.user} className="h-20 w-20" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link to="/users/$id" params={data.user}>
                  <Button variant="link" className="text-xl font-semibold p-0 h-auto">
                    {data.user.display_name}
                  </Button>
                </Link>
                <div className="flex gap-1">
                  {data.user.roles.map((role) => (
                    <Badge key={role.id} variant="secondary" className="text-xs">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Signed in: {data.created_at.toLocaleString()}</span>
              </div>
              {data.ends_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4" />
                  <span>Signed out: {data.ends_at.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LocationIcon className="h-5 w-5 text-muted-foreground" location={data.location.name} />
              <span className="font-medium">Location:</span>
              <Badge variant="outline" className="rounded-md">
                {toTitleCase(data.location.name)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Reason:</span>
              <SignInReason reason={data.reason} className="flex-none justify-start" />
            </div>
          </div>

          <Separator />
          {data.tools.length !== 0 && (
            <div className="flex flex-row justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DrillIcon className="h-5 w-5" />
                  Tools Used
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {data.tools.map((tool) => (
                    <li key={tool} className="text-muted-foreground">
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
              {user?.roles.some((role) => role.name === "Rep") && (
                <div className="flex justify-end flex-col">
                  <AddUserAttributes user={data.user} onShiftReps={[]} activeLocation={data.location.name} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute({
  loader: async ({ params }) => await client.signIns.get({ input: { id: params.id } }),
  component: Component,
});
