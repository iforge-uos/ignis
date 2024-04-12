import { UserAvatar } from "@/components/avatar";
import { INFRACTION_TYPES, REP_ON_SHIFT } from "@/lib/constants";
import { toTitleCase } from "@/lib/utils";
import { AppRootState } from "@/redux/store";
import { PostSignOut, PostSignOutProps } from "@/services/signin/signInService";
import addInPersonTraining from "@/services/users/addInPersonTraining";
import addInfraction from "@/services/users/addInfraction";
import { getUserTraining } from "@/services/users/getUserTraining";
import { getUserTrainingRemaining } from "@/services/users/getUserTrainingRemaining";
import revokeTraining from "@/services/users/revokeTraining";
import type { Location, PartialReason } from "@ignis/types/sign_in";
import type { InfractionType, PartialUser } from "@ignis/types/users";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import DatePickerWithRange from "@ui/components/date-picker-with-range";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { Calendar } from "@ui/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Checkbox } from "@ui/components/ui/checkbox";
import { Label } from "@ui/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import { Separator } from "@ui/components/ui/separator";
import { Textarea } from "@ui/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { cn } from "@ui/lib/utils";
import { addDays, addMonths, format, startOfDay } from "date-fns";
import { CalendarIcon, LogOut, Plus } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { useSelector } from "react-redux";
import { toast } from "sonner";

type Addable = "Training" | "Infraction";
const ADDABLE: Addable[] = ["Training", "Infraction"];
const SECTION_DESCRIPTION = {
  Training: "Add a new training entry to a user's profile.",
  Infraction: "Add an infraction record to a user's profile.",
};

interface AddToUserProps {
  user: PartialUser;
  location: Location;
  onShiftReps: PartialUser[];
}

const TrainingSection: React.FC<AddToUserProps> = ({ user, location, onShiftReps }) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [repSigningOff, setRepSigningOff] = React.useState<string>();
  const [training, setTraining] = React.useState<string>();
  const { data: remainingTrainings } = useQuery({
    queryKey: ["userTrainingRemaining", user.id],
    queryFn: () => getUserTrainingRemaining(user.id),
  });

  return (
    <>
      <div className="m-2">
        <Label>Training</Label>
        <Select required onValueChange={setTraining}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Choose in person training" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {remainingTrainings?.map((training) =>
                training.locations.includes(location.toUpperCase() as Uppercase<Location>) ? (
                  <SelectItem value={training.id}>{training.name}</SelectItem>
                ) : undefined,
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="m-2">
        <Label>Date Acquired</Label>
        <br />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date > new Date() || date < new Date("2015-01-01")} // a fun epoch
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="m-2">
        <Label>Verified by</Label>
        <Select required onValueChange={setRepSigningOff}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Choose an on shift Rep" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {onShiftReps?.map((rep) => (
                <SelectItem value={rep.id}>{rep.display_name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          onClick={() => {
            try {
              addInPersonTraining(user.id, training!, { rep_id: repSigningOff!, created_at: date! });
            } catch (e) {
              return toast.error(`Failed to submit contact the IT Team ${e}`);
            }
            toast.success("Successfully submitted");
          }}
          disabled={!(training && date && repSigningOff)}
        >
          Add
        </Button>
      </div>
    </>
  );
};

const InfractionSection: React.FC<AddToUserProps> = ({ user, location, onShiftReps }) => {
  // TODO auto log onShiftReps
  const [type, setType] = React.useState<InfractionType>("WARNING");
  const [reason, setReason] = React.useState<string>("");
  const [resolved, setResolved] = React.useState<boolean>(true);

  const [trainingToRevoke, setTrainingToRevoke] = React.useState<string>();
  const { data: trainings } = useQuery({
    queryKey: ["userTraining", user.id],
    queryFn: () => getUserTraining(user.id),
  });

  const now = new Date();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: now,
    to: addDays(now, 7),
  });

  let extra_field = (
    <div className="m-2 flex items-center space-x-2">
      <Checkbox
        id={"resolved-checkbox"}
        defaultChecked={true}
        required
        onCheckedChange={() => setResolved((oldValue) => !oldValue)}
      />
      <Label htmlFor={"resolved-checkbox"} className="hover:cursor-pointer">
        <text>Resolved? (untick if needs investigation)</text>
      </Label>
    </div>
  );
  let buttonDisabled = !type;
  let buttonOnClick = () =>
    addInfraction(user.id, {
      type,
      resolved,
      reason,
      created_at: date?.from || new Date(),
      duration:
        type === "TEMP_BAN" ? Math.round((date!.to!.getTime() - date!.from!.getTime()) / 1000 / 60 / 60) : undefined,
    });

  switch (type) {
    case "TEMP_BAN": // FIXME this insta break
      buttonDisabled = !(type && date?.from && date?.to);
      extra_field = (
        <>
          {extra_field}
          <div className="m-2">
            <Label>Duration</Label>
            <DatePickerWithRange date={date} setDate={setDate} disabled={(date) => date < startOfDay(now)} />
          </div>
        </>
      );
      break;
    case "TRAINING_ISSUE":
      buttonDisabled = !(type && trainingToRevoke);
      buttonOnClick = () => revokeTraining(user.id, trainingToRevoke!, { reason });

      extra_field = (
        <div className="m-2">
          <Label>Training</Label>
          <Select onValueChange={setTrainingToRevoke}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Training to remove" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {trainings?.map((training) =>
                  training.locations.includes(location.toUpperCase() as Uppercase<Location>) ? (
                    <SelectItem value={training.id}>{training.name}</SelectItem>
                  ) : undefined,
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      );
      break;
    default:
      break;
  }

  return (
    <>
      <div className="m-2">
        <Label>Type</Label>
        <Select
          required
          onValueChange={(value) => {
            setTrainingToRevoke(undefined);
            setDate(undefined);
            // @ts-ignore: setInfractionType should always be safe
            setType(value);
          }}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Type of infraction" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {INFRACTION_TYPES.map((type) => (
                <SelectItem value={type}>{toTitleCase(type.split("_").join(" "))}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {extra_field}
      <div className="m-2">
        <Label htmlFor="message">Reason</Label>
        <Textarea
          required
          className="w-[280px]"
          placeholder="Please include a little summary of the issue."
          id="message"
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="flex justify-center">
        <Button
          type="submit"
          onClick={() => {
            try {
              buttonOnClick();
            } catch (e) {
              return toast.error(`Failed to submit contact the IT Team ${e}`);
            }
            toast.success("Successfully submitted");
          }}
          disabled={buttonDisabled}
        >
          Add
        </Button>
      </div>
    </>
  );
};

const sectionComponents: Record<Addable, (props: AddToUserProps) => React.ReactElement> = {
  Training: ({ user, location, onShiftReps }) => (
    <TrainingSection user={user} location={location} onShiftReps={onShiftReps} />
  ),
  Infraction: ({ user, location, onShiftReps }) => (
    <InfractionSection user={user} location={location} onShiftReps={onShiftReps} />
  ),
};

const AddToUser: React.FC<AddToUserProps> = ({ user, location, onShiftReps }) => {
  const [section, setSection] = React.useState<Addable>("Training");

  if (!sectionComponents[section]) {
    throw Error("unreachable");
  }

  return (
    <>
      <div className="rounded-sm flex mb-2">
        {ADDABLE.map((title, idx) => {
          let indexStyle = "rounded-none";
          if (idx === 0) {
            indexStyle = "rounded-none rounded-l-md";
          } else if (idx === ADDABLE.length - 1) {
            indexStyle = "rounded-none rounded-r-md";
          }
          return (
            <Button
              className={`w-full justify-center flex-grow ${indexStyle} ${
                title !== section ? "bg-popover-background" : ""
              }`}
              onClick={() => setSection(title)}
            >
              <text className={`${title === section ? "font-bold" : ""}`}>Add {title}</text>
            </Button>
          );
        })}
      </div>
      <Separator />
      <div className="my-2">{SECTION_DESCRIPTION[section]}</div>
      {sectionComponents[section]({ user, location, onShiftReps })}
    </>
  );
};

interface SignInUserCardProps {
  user: PartialUser;
  tools?: string[];
  reason?: PartialReason;
  onSignOut?: () => void;
  onShiftReps?: PartialUser[];
}

export const SignedInUserCard: React.FC<SignInUserCardProps> = ({ user, tools, reason, onSignOut, onShiftReps }) => {
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const abortController = new AbortController();
  const onShift = reason?.name === REP_ON_SHIFT;

  const signOutProps: PostSignOutProps = {
    locationName: activeLocation,
    uCardNumber: user.ucard_number,
    signal: abortController.signal,
  };

  const { mutate } = useMutation({
    mutationKey: ["postSignOut", signOutProps],
    mutationFn: () => PostSignOut(signOutProps),
    retry: 0,
    onError: (error) => {
      console.error("Error", error);
      abortController.abort();
    },
    onSuccess: () => {
      abortController.abort();
      toast.success(`Successfully signed out ${user.display_name}`);
      onSignOut?.();
    },
  });

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      mutate();
    }
  };

  return (
    <>
      <Card className="w-[350px]">
        <CardHeader>
          <div className="flex justify-between">
            <div className="m-1">
              <CardTitle className="hover:underline">
                <Link to={`/users/${user.id}` as string}>{user.display_name}</Link>
              </CardTitle>
              <CardDescription className="my-2 flex flex-wrap">
                {user.roles.map((role) => (
                  <Badge className="rounded-sm bg-accent m-0.5">
                    <text className="text-accent-foreground">{role.name}</text>
                  </Badge>
                ))}
              </CardDescription>
            </div>
            <UserAvatar user={user} className="h-16 w-16 " />
          </div>
        </CardHeader>
        {!onShift ? (
          <CardContent className="-my-2">
            {reason && <CardDescription>Sign in reason: {reason.name}</CardDescription>}
            {tools && <CardDescription>Tools: {tools.join(", ")}</CardDescription>}
          </CardContent>
        ) : undefined}
        <CardFooter className="flex justify-between">
          <Popover>
            <TooltipProvider>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button className="bg-accent" disabled={!onShiftReps}>
                      <Plus className="stroke-accent-foreground" />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>Add in-person training and infractions.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-350">
              {onShiftReps ? <AddToUser user={user} onShiftReps={onShiftReps} location={activeLocation} /> : undefined}
            </PopoverContent>
          </Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSignOut}>
                  <LogOut />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign out user.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </>
  );
};
