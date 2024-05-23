import { TrainingContent } from "@/routes/_authenticated/training/$id";
import { PartialTrainingWithStatus } from "@ignis/types/training";
import { Link } from "@tanstack/react-router";
import { Button } from "@ui/components/ui/button";
import { Card } from "@ui/components/ui/card";
import { Separator } from "@ui/components/ui/separator";

interface TrainingCourseCardProps {
  training: PartialTrainingWithStatus;
  isRep: boolean;
}

export default function TrainingCourseCard({
                                             training,
                                             isRep,
                                           }: TrainingCourseCardProps) {
  return (
      <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col">
        <div className="rounded-t-lg overflow-hidden">
          <img
              alt={training.name}
              className="w-full h-full object-cover"
              height="200"
              src="https://wallpapers.com/images/featured-full/super-cool-pictures-h943jt67w6kqn4e6.jpg"
              style={{
                aspectRatio: "400/200",
                objectFit: "cover",
              }}
              width="400"
          />
        </div>
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-2 text-balance">{training.name}</h3>
            <Separator />
            <div className="text-sm text-muted-foreground mt-2 text-balance">
              <TrainingContent content={training.description} />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Link to="/training/$id" params={training}>
              <Button variant={"default"}>
                {training.status}
              </Button>
            </Link>
            {isRep && training.rep !== null && (
                <Link to="/training/$id" params={training.rep!}>
                  <Button variant={"outline"}>
                    {`${training.rep.status} Rep Training`}
                  </Button>
                </Link>
            )}
          </div>
        </div>
      </Card>
  );
}
