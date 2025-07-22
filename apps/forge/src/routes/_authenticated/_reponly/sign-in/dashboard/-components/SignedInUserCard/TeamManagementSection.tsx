import { Hammer } from "@/components/loading";
import { TeamIcon } from "@/icons/Team";
import { orpc } from "@/lib/orpc";
import { ManageUserWidgetProps } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/ManageUserWidget";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShortTeam } from "@packages/types/users";
import { Button } from "@packages/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@packages/ui/components/form";
import { MultiSelect } from "@packages/ui/components/multi-select";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const FormSchema = z.object({
  teams: z.array(z.string()).min(1).nonempty("Please select at least one team."),
});

export const TeamManagementSection: React.FC<ManageUserWidgetProps> = ({ user }) => {
  const {
    data: teams,
    isLoading,
    error,
  } = useQuery(
    orpc.teams.allAssignable.queryOptions({
      staleTime: 600_000,
      refetchInterval: 900_000,
    }),
  );

  function getFormDefaults(userTeams: ShortTeam[]) {
    // if data is empty or undefined
    if (userTeams.length === 0) {
      return [];
    }

    // otherwise, return a list of the ids
    return userTeams.map((team) => team.id);
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      teams: getFormDefaults(user.teams),
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      orpc.users.promote.call({ id: user.id, team_ids: data.teams ?? [] });
    } catch (e) {
      return toast.error(`Failed to submit contact the IT Team ${e}`);
    }
    toast("Successfully promoted user to rep!");
  }

  if (!teams || error) return null;

  if (isLoading) {
    return <Hammer />;
  }

  const teamsList = teams.map((team) => ({
    value: team.id,
    label: team.name,
    icon: () => <TeamIcon team={team.name} className="stroke-black dark:stroke-white mr-1 h-4 w-4" />,
  }));

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-8">
            <FormField
              control={form.control}
              name="teams"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Teams</FormLabel>
                  <FormControl>
                    <MultiSelectFormField
                      options={teamsList}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className="rounded-sm bg-accent dark:bg-neutral-800 m-0.5 w-full pt-1.5 pb-1.5 text-black dark:text-white"
                      placeholder="Select options"
                      variant="inverted"
                    />
                  </FormControl>
                  <FormDescription>Choose the teams you want the place the person in.</FormDescription>
                  <FormMessage className="bg-info text-info-foreground p-2 text-balance">
                    By clicking submit you will change the user to either become a rep with those teams, or modify a
                    reps existing teams to match the current selection.
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="flex justify-center w-full">
              <Button variant="default" type="submit" className="w-1/2">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};
