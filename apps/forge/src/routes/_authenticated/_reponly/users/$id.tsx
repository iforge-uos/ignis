import { UserAvatar } from "@/components/avatar";
import { LocationIcon } from "@/components/icons";
import SignInsChart from "@/components/signin/dashboard/components/SignInsChart.tsx";
import Title from "@/components/title";
import { extractError } from "@/lib/utils";
import { getUser } from "@/services/users/getUser.ts";
import getUserSignIns from "@/services/users/getUserSignIns.ts";
import { getUserTraining } from "@/services/users/getUserTraining.ts";
import { Training } from "@ignis/types/users.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/components/ui/table.tsx";
import { isAxiosError } from "axios";
import { Check, Loader, X } from "lucide-react";

async function getData(id: string) {
  const user = await getUser(id);
  const trainings = await getUserTraining(id);
  const signIns = await getUserSignIns(id);
  return {
    user,
    trainings,
    signIns,
  };
}

export default function Component() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => getData(id),
  });

  if (error) {
    if (isAxiosError(error) && error.status === 404) {
      throw notFound();
    }
    <>
      An error occurred fetching the user:
      <br />
      {extractError(error!)}
    </>;
  }

  if (isLoading) {
    return <Loader />;
  }
  const { user, trainings, signIns } = data!;
  const rep = user.roles.some((role) => role.name === "Rep");
  const locationIcon = (training: Training) => {
    return training.locations.map((location) => <LocationIcon location={location} />);
  };

  return (
    <>
      <Title prompt={`User ${user.display_name}`} />
      <div className="flex flex-col h-screen">
        <main className="flex flex-1 flex-col gap-4 p-2 md:gap-8 md:p-6">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">{user.display_name}</h1>
          </div>
          <div className="flex flex-row border border-r-0">
            <div className="flex-col p-6">
              <div className="grid gap-2 justify-center">
                <UserAvatar user={user} className="h-30 w-30" />
              </div>
              <div>
                <div className="text-sm mt-2">Roles</div>
                <div className="flex flex-wrap">
                  {user.roles.map((role) => (
                    <Badge variant="outline">{role.name}</Badge>
                  ))}
                </div>
              </div>
              {user.pronouns && (
                <div className="mt-2">
                  <div className="font-medium">Pronouns</div>
                  <div className="text-gray-500 dark:text-gray-400">{user.pronouns}</div>
                </div>
              )}
              <div className="mt-2">
                <div className="font-medium">Email</div>
                <a className="text-primary" href={`mailto:${user.email}@sheffield.ac.uk`}>
                  {user.email}
                </a>
              </div>
              <div className="mt-2">
                <div className="font-medium">UCard Number</div>
                <div className="text-gray-500 dark:text-gray-400">{user.ucard_number}</div>
              </div>
              <div className="mt-2">
                <div className="font-medium">Department</div>
                <div className="text-gray-500 dark:text-gray-400">{user.organisational_unit}</div>
              </div>
            </div>

            <div className="border shadow-sm rounded-lg flex-grow">
              <h1 className="text-center m-2 text-lg">Training</h1>
              <Table>
                <TableHeader className="bg-accent">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Location</TableHead>
                    <TableHead className="text-center">Compulsory</TableHead>
                    {rep ? <TableHead className="text-center">Rep Training</TableHead> : undefined}
                    <TableHead className="text-center">Completed On</TableHead>
                    <TableHead className="text-center">Completed In Person On</TableHead>
                    <TableHead className="text-center">Renewal Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* sorting stably is for losers */}
                  {trainings
                    .sort((a, b) => (a.name < b.name ? -1 : 1))
                    .map((training) =>
                      training["@created_at"] ? (
                        <TableRow>
                          <TableCell>
                            <div className="text-sm">{training.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">{locationIcon(training)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              {training.compulsory ? <Check stroke="green" /> : <X stroke="red" />}
                            </div>
                          </TableCell>
                          {rep ? ( // FIXME this is mostly broken
                            <TableCell>
                              <div className="flex justify-center">
                                {training.rep ? <Check stroke="green" /> : <X stroke="red" />}
                              </div>
                            </TableCell>
                          ) : undefined}
                          <TableCell>
                            <div className="text-sm text-center">
                              {new Date(training["@created_at"]).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-center">
                              {training["@in_person_created_at"]
                                ? new Date(training["@in_person_created_at"]).toLocaleDateString()
                                : training["@in_person_created_at"] === undefined
                                  ? "-"
                                  : "Never"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-center">
                              {
                                training.renewal_due ? new Date(training.renewal_due).toLocaleDateString() : "Never"
                                // FIXME this is also broken
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : undefined,
                    )}
                </TableBody>
              </Table>
              <h1 className="text-center m-2 text-lg">Sign Ins</h1>
              <SignInsChart data={signIns} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/_reponly/users/$id")({
  component: Component,
});
