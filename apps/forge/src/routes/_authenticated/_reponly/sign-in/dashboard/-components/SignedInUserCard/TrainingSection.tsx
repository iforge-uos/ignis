import { activeLocationAtom } from "@/atoms/signInAppAtoms";
import { iForgeEpoch } from "@/config/constants";
import { ManageUserWidgetProps } from "@/routes/_authenticated/_reponly/sign-in/dashboard/-components/SignedInUserCard/ManageUserWidget.tsx";
import addInPersonTraining from "@/services/users/addInPersonTraining.ts";
import { getUserTrainingRemaining } from "@/services/users/getUserTrainingRemaining.ts";
import type { LocationName } from "@ignis/types/sign_in.ts";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@ui/components/ui/button.tsx";
import { Calendar } from "@ui/components/ui/calendar.tsx";
import { Label } from "@ui/components/ui/label.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select.tsx";
import { cn } from "@ui/lib/utils.ts";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { getTrainingSelectabilityIcons } from "../../../actions/-components/ToolSelectionInput";

export const TrainingSection: React.FC<ManageUserWidgetProps> = ({ user, locationName: location, onShiftReps }) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [repSigningOff, setRepSigningOff] = React.useState<string>();
  const [training, setTraining] = React.useState<string>();
  const activeLocation = useAtomValue(activeLocationAtom);
  const { data: remainingTrainings } = useQuery({
    queryKey: ["userTrainingRemaining", user.id],
    queryFn: () => getUserTrainingRemaining(user.id, activeLocation),
  });

  return (
    <>
      <div className="m-2">
        <Label>Training</Label>
        <Select required onValueChange={setTraining}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Choose in person training" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {remainingTrainings?.map((training) => {
                const Icon = getTrainingSelectabilityIcons(training);
                return (
                  <SelectItem
                    key={training.id}
                    value={training.id}
                    disabled={training.selectable.length !== 1 && !training.selectable.includes("IN_PERSON_MISSING")}
                  >
                    <div>
                      {Icon}
                      {training.name}
                    </div>
                  </SelectItem>
                );
              }) || (
                <SelectItem value={"unselectable"} disabled>
                  No available trainings
                </SelectItem>
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
              className={cn("w-full mt-2 justify-start text-left font-normal", !date && "text-muted-foreground")}
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
              disabled={(date) => date > new Date() || date < iForgeEpoch}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="m-2">
        <Label>Verified by</Label>
        <Select required onValueChange={setRepSigningOff}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose an on shift Rep" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {onShiftReps && onShiftReps.length > 0 ? (
                onShiftReps.map((rep) => (
                  <SelectItem value={rep.id} key={rep.id}>
                    {rep.display_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem className="w-fit" value={"unselectable"} disabled>
                  <p>
                    No reps on shift! <br /> Make sure there is a Rep signed in!
                  </p>
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          className="w-1/2 mt-2 flex items-center justify-center"
          onClick={() => {
            try {
              addInPersonTraining(user.id, training!, { rep_id: repSigningOff!, created_at: date! }).then(() =>
                toast.success("Successfully submitted"),
              );
            } catch (e) {
              return toast.error(`Failed to submit contact the IT Team ${e}`);
            }
          }}
          disabled={!(training && date && repSigningOff)}
        >
          Add
        </Button>
      </div>
    </>
  );
};
