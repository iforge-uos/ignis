import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserTrainingRemaining } from "@/services/users/getUserTrainingRemaining.ts";
import { Label } from "@ui/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select.tsx";
import type { Location } from "@ignis/types/sign_in.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover.tsx";
import { Button } from "@ui/components/ui/button.tsx";
import { cn } from "@ui/lib/utils.ts";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@ui/components/ui/calendar.tsx";
import addInPersonTraining from "@/services/users/addInPersonTraining.ts";
import { toast } from "sonner";
import { AddToUserProps } from "@/components/signin/dashboard/components/SignedInUserCard/subcomponents/AddToUser.tsx";

export const TrainingSection: React.FC<AddToUserProps> = ({ user, location, onShiftReps }) => {
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