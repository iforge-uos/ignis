import { Training } from "@ignis/types/training";
import { Badge } from "@ui/components/ui/badge";
import { Separator } from "@ui/components/ui/separator";
import { format } from "date-fns";
import { LocationIcon } from "../icons/Locations";

export function TrainingHeader({ data }: { data: Training }) {
  return (
    <>
      <div className="space-y-2 flex justify-between">
        <div>
          <div className="flex mb-2 items-center">
            <h2 className="text-2xl font-semibold mb-2">Locations:</h2>
            {data.locations.map((value) => (
              <Badge variant="outline" key={value} className="flex rounded-md py-[14px] gap-2 ml-2">
                <LocationIcon location={value} className="-m-1.5 w-4 mx-0.5" />
              </Badge>
            ))}
          </div>
          <div className="flex mb-2 items-center">
            <h2 className="text-2xl font-semibold mb-2">Tags:</h2>
            {[
              data.compulsory ? "Compulsory" : undefined,
              data.in_person ? "In-Person Training Required" : undefined,
              data.rep ? undefined : "Rep Training",
            ]
              .filter(Boolean)
              .map((tag) => (
                <Badge variant="outline" key={tag} className="flex rounded-md py-2 gap-2 ml-2">
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <div className="flex text-2xl mb-2 justify-end items-center">
            <text className="font-semibold">Created:</text>
            <Badge variant="outline" className="flex rounded-md py-2 gap-2 ml-2">
              {format(data.created_at, "PPP")}
            </Badge>
          </div>
          <div className="flex text-2xl mb-2 justify-end">
            <text className="font-semibold">Last Updated:</text>
            <Badge variant="outline" className="flex rounded-md py-2 gap-2 ml-2">
              {format(data.updated_at, "PPP")}
            </Badge>
          </div>
        </div>
      </div>
      <Separator />
      <br />
    </>
  );
}
