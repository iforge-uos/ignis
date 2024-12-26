import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Link } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { MessageCircleWarning } from "lucide-react";
import { useState } from "react";
import { PulseLoader } from "react-spinners";

import { activeLocationAtom, locationStatusesAtom } from "@/atoms/signInAppAtoms.ts";
import { QueueStatus } from "@/components/sign-in/ActiveLocationSelector/QueueStatus.tsx";
import { StatusBadge } from "@/components/sign-in/ActiveLocationSelector/StatusBadge.tsx";
import { UserCount } from "@/components/sign-in/ActiveLocationSelector/UserCount.tsx";
import { cn, removeSuffix, toTitleCase } from "@/lib/utils";
import { LocationName } from "@ignis/types/sign_in";

import { Button } from "@ui/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@ui/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover";
import { Separator } from "@ui/components/ui/separator.tsx";
import { Skeleton } from "@ui/components/ui/skeleton.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";

const ActiveLocationSelector = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeLocation, setActiveLocation] = useAtom(activeLocationAtom);
  const [{ data: locationStatuses, isLoading, isError }] = useAtom(locationStatusesAtom);

  const borderColor = !locationStatuses || isError ? "border-destructive border-2 border-dashed" : "border-0";

  const activeLocationStatus = locationStatuses?.[activeLocation];

  return (
    <div className="flex flex-col space-y-3 p-4 bg-card text-card-foreground mt-4 mb-4 drop-shadow-lg dark:shadow-none md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
      <div className="w-full md:w-auto">
        <span className="font-medium block mb-2 md:inline md:mb-0 md:mr-2">Select Location</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-full md:w-[200px] justify-between border-2 ${borderColor} h-10`}
            >
              {activeLocation ? toTitleCase(activeLocation) : "No active location selected"}
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search locations..." className="h-9" />
              {!isLoading && <CommandEmpty>No locations found.</CommandEmpty>}
              <CommandGroup>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[40px]">
                    <PulseLoader color="#e11d48" size={15} />
                  </div>
                ) : (
                  <>
                    {locationStatuses &&
                      Object.keys(locationStatuses).map((name) => (
                        <CommandItem
                          key={name}
                          value={name}
                          onSelect={(currentValue) => {
                            const location = currentValue.toUpperCase() as LocationName;
                            setActiveLocation(location);
                            setOpen(false);
                          }}
                        >
                          {toTitleCase(name)}
                          <CheckIcon
                            className={cn("ml-auto h-4 w-4", activeLocation === name ? "opacity-100" : "opacity-0")}
                          />
                        </CommandItem>
                      ))}
                  </>
                )}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {isLoading && (
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
          <Skeleton className="w-full md:w-[110px] h-[40px]" />
          <Separator orientation="horizontal" className="md:hidden" />
          <Separator orientation="vertical" className="hidden md:block" />
          <Skeleton className="w-full md:w-[170px] h-[40px]" />
          <Skeleton className="w-full md:w-[180px] h-[40px]" />
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-destructive text-destructive-foreground">
          <MessageCircleWarning />
          <p>Error Fetching Location Status</p>
        </div>
      )}
      {activeLocationStatus && !isLoading && !isError && (
        <div className="flex flex-col space-y-2 w-full md:w-auto md:flex-row md:items-center md:space-y-0 md:space-x-2 md:h-10 md:whitespace-nowrap">
          <Tooltip>
            <TooltipTrigger>
              <StatusBadge
                is_open={activeLocationStatus.status === "OPEN"}
                is_out_of_hours={activeLocationStatus.out_of_hours}
                className="w-full md:w-auto h-10 flex items-center justify-center"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>The space is marked as OPEN when there is at least one rep signed in.</p>
              <p>It is closed otherwise.</p>
              <p>
                Current opening hours are: {removeSuffix(activeLocationStatus.opening_time, ":00")} -{" "}
                {removeSuffix(activeLocationStatus.closing_time, ":00")}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <UserCount
                rep_count={activeLocationStatus.on_shift_rep_count}
                off_shift_rep_count={activeLocationStatus.off_shift_rep_count}
                user_count={activeLocationStatus.user_count}
                max_count={activeLocationStatus.max}
                className="w-full md:w-auto h-10 flex items-center justify-center md:whitespace-nowrap"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view a more detailed breakdown of the user count.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <QueueStatus
                queue_needed={activeLocationStatus.needs_queue}
                count_in_queue={activeLocationStatus.count_in_queue}
                className="w-full md:w-auto h-10 flex items-center justify-center"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>The Queue is only enabled when capacity is reached.</p>
              <p>
                To view detailed queue status visit the{" "}
                <Link className="underline" to={"/sign-in/dashboard"}>
                  dashboard
                </Link>
                .
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default ActiveLocationSelector;
