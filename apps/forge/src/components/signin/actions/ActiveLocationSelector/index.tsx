// @ts-ignore

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

    if (activeLocation != "") {
      setValue(activeLocation);
    }
  }, [locationStatuses, dispatch, isError, activeLocation, error]);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleLocationSelect = (selectedLocationName: string) => {
    dispatch(signinActions.setActiveLocation(selectedLocationName));
  };

  const activeLocationStatus = locationStatuses?.find((status) => status.locationName === activeLocation);

  return (
    <>
      <div className="flex items-center justify-between p-3 space-x-4 bg-navbar text-navbar-foreground mt-4 mb-4 drop-shadow-lg dark:shadow-none flex-col md:flex-row">
        <div>
          <span className="text-gray-700 dark:text-white font-medium mr-2">Select Location</span>
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
                        locationStatuses!.map((location, index) => (
                          <CommandItem
                            key={index}
                            value={location.locationName}
                            onSelect={(currentValue) => {
                              setValue(currentValue);
                              setOpen(false);
                              handleLocationSelect(currentValue);
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
        {isLoading && <PulseLoader color="#e11d48" size={10} />}
        {activeLocationStatus && !isLoading && (
          <div className="flex items-center gap-2 mt-2 lg:mt-0">
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            {/* Open Status */}
            {activeLocationStatus.open ? (
              <span className="text-green-500">OPEN</span>
            ) : (
              <span className="text-red-500">CLOSED</span>
            )}
            <Separator orientation="vertical" />
            {/* Count and Max Count Status */}

            <span className="text-gray-500 dark:text-gray-400">Current Users </span>
            <span className="text-navbar-foreground">
              {" "}
              {activeLocationStatus.count}/{activeLocationStatus.max}
            </span>
            <span className="text-gray-500 dark:text-gray-400">Max Users </span>
            {/* Queue Status */}

            {activeLocationStatus.needs_queue ? (
              <span className="text-red-500">Queue Needed</span>
            ) : (
              <span className="text-green-500">No Queue Needed</span>
            )}
            <Separator orientation="vertical" />
            <span className="text-navbar-foreground"> {activeLocationStatus.count_in_queue}</span>
            <span className="text-gray-500 dark:text-gray-400">in Queue</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ActiveLocationSelector;
