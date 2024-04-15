import * as React from "react";
import type { InfractionType } from "@ignis/types/users.ts";
import { useQuery } from "@tanstack/react-query";
import { getUserTraining } from "@/services/users/getUserTraining.ts";
import { DateRange } from "react-day-picker";
import { addDays, startOfDay } from "date-fns";
import { Checkbox } from "@ui/components/ui/checkbox.tsx";
import { Label } from "@ui/components/ui/label.tsx";
import addInfraction from "@/services/users/addInfraction.ts";
import DatePickerWithRange from "@ui/components/date-picker-with-range.tsx";
import revokeTraining from "@/services/users/revokeTraining.ts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select.tsx";
import type { Location } from "@ignis/types/sign_in.ts";
import { INFRACTION_TYPES } from "@/lib/constants.ts";
import { toTitleCase } from "@/lib/utils.ts";
import { Textarea } from "@ui/components/ui/textarea.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { toast } from "sonner";
import { AddToUserProps } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/AddToUser.tsx";

export const InfractionSection: React.FC<AddToUserProps> = ({ user, location, onShiftReps }) => {
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
