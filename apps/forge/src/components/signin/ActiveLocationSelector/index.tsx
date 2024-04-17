import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@ui/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@ui/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/ui/popover";
import { useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, AppRootState } from "@/redux/store.ts";
import { signinActions } from "@/redux/signin.slice.ts";
import { locationStatus } from "@/services/signin/locationService.ts";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@ui/components/ui/separator.tsx";
import { PulseLoader } from "react-spinners";
import { Location } from "@ignis/types/sign_in.ts";
import { UserCount } from "@/components/signin/ActiveLocationSelector/UserCount.tsx";
import { StatusBadge } from "@/components/signin/ActiveLocationSelector/StatusBadge.tsx";
import { QueueStatus } from "@/components/signin/ActiveLocationSelector/QueueStatus.tsx";
import { Skeleton } from "@ui/components/ui/skeleton.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip.tsx";
import { Link } from "@tanstack/react-router";

const ActiveLocationSelector = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
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

  const borderColor = !locationStatuses || isError ? "border-red-500" : "border-transparent";

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

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleLocationSelect = (selectedLocationName: Location) => {
    dispatch(signinActions.setActiveLocation(selectedLocationName));
  };

  const activeLocationStatus = locationStatuses?.find((status) => status.locationName === activeLocation);

  return (
    <>
      <div className="flex items-center justify-between p-3 space-x-4 bg-card text-card-foreground mt-4 mb-4 drop-shadow-lg dark:shadow-none flex-col md:flex-row">
        <div>
          <span className="font-medium mr-2">Select Location</span>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={`w-[200px] justify-between border-2 ${borderColor}`}
              >
                {value ? capitalizeFirstLetter(value) : "No active location selected"}
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
                      <PulseLoader color="#e11d48" size={15} />{" "}
                    </div>
                  ) : (
                    <>
                      {locationStatuses &&
                        locationStatuses!.map((location) => (
                          <CommandItem
                            key={location.locationName}
                            value={location.locationName}
                            onSelect={(currentValue) => {
                              setValue(currentValue);
                              setOpen(false);
                              handleLocationSelect(currentValue as Location);
                            }}
                          >
                            {capitalizeFirstLetter(location.locationName)}
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                value === location.locationName ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}{" "}
                    </>
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 mt-2 lg:mt-0">
            <Skeleton className="w-[110px] h-[40px]" />
            <Separator orientation="vertical" />
            <Skeleton className="w-[240px] h-[40px]" />
            <Skeleton className="w-[250px] h-[40px]" />
          </div>
        )}
        {activeLocationStatus && !isLoading && (
          <div className="flex items-center gap-2 mt-2 lg:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <StatusBadge
                    is_open={activeLocationStatus.open}
                    is_out_of_hours={activeLocationStatus.out_of_hours}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The space is marked as OPEN when there is at least one rep signed in.</p>
                  <p>It is closed otherwise</p>
                  <p>Current opening hours are: 12:00 - 20:00</p>
                </TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" />
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
                  <p>Click to view a more detailed breakdown of the count</p>
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
                    The view detailed queue status visit the{" "}
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
    </>
  );
};

export default ActiveLocationSelector;
