import { UserAvatar } from "@/components/avatar";
import Title from "@/components/title";
import { LocationIcon } from "@/icons/Locations";
import { client, orpc } from "@/lib/orpc";
import SignInChart from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignInChart";
import { Training } from "@packages/types/users";
import { Badge } from "@packages/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Check, X } from "lucide-react";

export default function Component() {
  const data = Route.useLoaderData();
  const { user, trainings, signIns } = data!;
  const rep = user!.roles.some((role) => role.name === "Rep");
  const locationIcon = (training: Training) => {
    return training.locations.map((location) => <LocationIcon location={location} key={training.id} />);
  };

  return (
    <>
      <Title prompt={`User ${user.display_name}`} />
      <div className="flex flex-col h-full">
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
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="outline" className="rounded-md">
                      {role.name}
                    </Badge>
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
                <div className="text-gray-500 dark:text-gray-400">XXX-{user.ucard_number}</div>
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
                    {rep && <TableHead className="text-center">Rep Training</TableHead>}
                    <TableHead className="text-center">Completed On</TableHead>
                    <TableHead className="text-center">Completed In Person On</TableHead>
                    <TableHead className="text-center">Renewal Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainings
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((training) =>
                      training["@created_at"] ? (
                        <TableRow key={training.id}>
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
                          {rep && ( // TODO if user training is a pre-req to rep training we can collapse the 2 into one entry.
                            <TableCell>
                              <div className="flex justify-center">
                                {training.rep ? <Check stroke="green" /> : <X stroke="red" />}
                              </div>
                            </TableCell>
                          )}
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
              <SignInChart data={signIns} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/_reponly/users/$id")({
  loader: async ({ params }) => {
    const userId = params.id;
    if (userId === undefined) {
      throw notFound();
    }
    const [user, trainings, signIns] = await Promise.all([
      client.users.get({ id: userId }),
      client.users.training.all({ id: userId }),
      client.users.signIns({ id: userId }),
    ]);
    return {
      user,
      trainings,
      signIns,
    };
  },
  component: Component,
});
