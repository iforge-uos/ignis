import { QueueStatus } from "@/components/signin/ActiveLocationSelector/QueueStatus.tsx";
import { StatusBadge } from "@/components/signin/ActiveLocationSelector/StatusBadge.tsx";
import { UserCount } from "@/components/signin/ActiveLocationSelector/UserCount.tsx";
import { cn, removeSuffix, toTitleCase } from "@/lib/utils";
import { signinActions } from "@/redux/signin.slice.ts";
import { AppDispatch, AppRootState } from "@/redux/store.ts";
import { locationStatus } from "@/services/signin/locationService.ts";
import { LocationName } from "@ignis/types/sign_in.ts";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@ui/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover";
import { Separator } from "@ui/components/ui/separator.tsx";
import { Skeleton } from "@ui/components/ui/skeleton.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";
import { MessageCircleWarning } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PulseLoader } from "react-spinners";

const ActiveLocationSelector = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<LocationName | null>();
  const activeLocation = useSelector((state: AppRootState) => state.signin.active_location);
  const refetchInterval = 5000;

  const {
    data: locationStatuses,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["locationStatus"],
    queryFn: locationStatus,
    staleTime: 4_000,
    refetchInterval: value ? refetchInterval : false, // Only refetch if a location is selected
  });

  const borderColor = !locationStatuses || isError ? "border-destructive border-2 border-dashed" : "border-0";

  const dispatch: AppDispatch = useDispatch();

  useLayoutEffect(() => {
    if (locationStatuses) {
      dispatch(signinActions.setLocations(locationStatuses));
      dispatch(signinActions.clearError());
    }
    if (isError) {
      dispatch(signinActions.setError(error.message));
    }

    setValue(activeLocation);
  }, [locationStatuses, dispatch, isError, activeLocation, error]);

  const handleLocationSelect = (selectedLocationName: LocationName) => {
    dispatch(signinActions.setActiveLocation(selectedLocationName));
  };

  const activeLocationStatus = locationStatuses?.[activeLocation];

  return (
    <div className="p-3 bg-card text-card-foreground mt-4 mb-4 drop-shadow-lg dark:shadow-none">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="w-full md:w-auto">
          <span className="font-medium block mb-2 md:inline md:mr-2">Select Location</span>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                // biome-ignore lint/a11y/useSemanticElements: I'll fix later - Sam
                role="combobox"
                aria-expanded={open}
                className={`w-full md:w-[200px] justify-between border-2 ${borderColor}`}
              >
                {value ? toTitleCase(value) : "No active location selected"}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
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
                              setValue(location);
                              setOpen(false);
                              handleLocationSelect(location);
                            }}
                          >
                            {toTitleCase(name)}
                            <CheckIcon
                              className={cn("ml-auto h-4 w-4", value === name ? "opacity-100" : "opacity-0")}
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

        <div className="w-full md:w-auto">
          {isLoading && (
            <div className="flex flex-col md:flex-row items-center gap-2">
              <Skeleton className="w-full md:w-[110px] h-[40px]" />
              <Separator orientation="horizontal" className="w-full md:hidden my-2" />
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
            <div className="flex flex-col md:flex-row items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <StatusBadge
                      is_open={activeLocationStatus.status === "open"}
                      is_out_of_hours={activeLocationStatus.out_of_hours}
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
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The Queue is only enabled when capacity is reached.</p>
                    <p>
                      To view detailed queue status visit the{" "}
                      <Link className="underline" to={"/signin/dashboard"}>
                        dashboard
                      </Link>
                      .
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveLocationSelector;
