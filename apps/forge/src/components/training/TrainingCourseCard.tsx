import { TrainingContent } from "@/routes/_authenticated/training/$id";
import { PartialTrainingWithStatus } from "@ignis/types/training";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Card } from "@ui/components/ui/card";
import { Separator } from "@ui/components/ui/separator";

export default function TrainingCourseCard({
  training,
  isRep,
}: {
  training: PartialTrainingWithStatus;
  isRep: boolean;
}) {
  return (
    <Card className="flex flex-col gap-2.5 p-4 border rounded-lg md:gap-4 md:p-8 hover:bg-accent">
      <div className="space-y-1 text-center md:text-left">
        <h3 className="text-lg font-bold">{training.name}</h3>
        <Separator />
        <img
          src="https://wallpapers.com/images/featured-full/super-cool-pictures-h943jt67w6kqn4e6.jpg"
          alt={training.name}
          height="100"
          className="aspect-[4/3] object-scale-down"
        />
        <div className="text-sm text-accent-foreground">
          <TrainingContent content={training.description} />
        </div>
      </div>
      <div className="mt-auto flex gap-1 min-[200px]:flex-row w-full justify-between">
        <Link to="/training/$id" params={training}>
          <Button className="flex h-8 rounded-md border text-xs md:h-10 md:px-4 md:text-sm">{training.status}</Button>
        </Link>
        {isRep && training.rep !== null && (
          <Link to="/training/$id" params={training.rep!}>
            <Button className="flex h-8 rounded-md border text-xs md:h-10 md:px-4 md:text-sm">
              {`${training.rep.status} Rep Training`}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
