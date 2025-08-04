import { TrainingContent } from "@/routes/_authenticated/training/$id";
import { PartialTrainingWithStatus } from "@packages/types/training";
import { Training } from "@packages/types/users";
import { Button } from "@packages/ui/components/button";
import { Card } from "@packages/ui/components/card";
import { Separator } from "@packages/ui/components/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { Link } from "@tanstack/react-router";
import { EditIcon } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

interface TrainingCourseCardProps {
  training: PartialTrainingWithStatus;
  userTraining?: Training[];
}

export default function TrainingCourseCard({ training, userTraining }: TrainingCourseCardProps) {
  const roles = useUserRoles();
  const isRep = roles.some((role) => role === "rep");
  const canEdit = roles.some((role) => role === "admin" || role === "training editor");

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg flex flex-col">
      <div className="relative m-4">
        <img
          alt={training.name}
          className="w-full h-full object-scale-down aspect-[2/1]"
          height="200"
          src={`/machines/${training.icon_url}`}
          draggable={false}
        />
        {canEdit && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/training/$id/edit" params={training} className="contents">
                  <Button className="absolute top-0 left-0">
                    <EditIcon />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit User Training</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/training/$id/edit" params={training.rep!} className="contents">
                  <Button className="absolute top-0 right-0" variant={"outline"}>
                    <EditIcon />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit Rep Training</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
      <div className="px-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-2xl font-bold text-primary mb-2 text-balance">{training.name}</h3>
          <Separator />
          <div className="text-sm text-muted-foreground mt-2 text-balance">
            <TrainingContent content={training.description} />
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Link to="/training/$id" params={training}>
            <Button variant={"default"}>{training.status}</Button>
          </Link>
          {isRep && training.rep !== null && (
            <Link to="/training/$id" params={training.rep!}>
              <Button
                variant={"outline"}
                disabled={!userTraining?.map((t) => t.id)?.includes(training.id)}
              >{`${training.rep.status} Rep Training`}</Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
