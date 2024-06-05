import Title from "@/components/title";
import { ALL_BADGES, cn, deserializeMd, extractError, trainingBadges } from "@/lib/utils";
import { get } from "@/services/training/get";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import MultipleSelector, { Option } from "@ui/components/multi-select";
import { PlateEditor } from "@ui/components/plate-ui/plate-editor";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/ui/alert";
import { badgeVariants } from "@ui/components/ui/badge";
import { Separator } from "@ui/components/ui/separator";
import axios from "axios";
import { Loader } from "lucide-react";
import React from "react";

function Component() {
  const { id } = Route.useParams();
  const [tags, setTags] = React.useState<Option[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getTraining", id],
    queryFn: () => get(id, { editing: true }),
  });

  React.useEffect(() => {
    if (data) {
      setTags(trainingBadges(data).map((tag) => ({ label: tag, value: tag })));
    }
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }
  if (error instanceof axios.AxiosError && error.response?.status === 404) {
    throw notFound();
  }
  if (error || !data) {
    return (
      <>
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error <br />
            {extractError(error!)}
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <Title prompt={`${data.name} Training`} />
      <div className="w-full py-6 space-y-4">
        <div className="container space-y-4 px-4 md:px-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-center">{data.name}</h1>
            <div className="space-y-2 flex justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  <MultipleSelector
                    badgeClassName={cn(badgeVariants({ variant: "outline" }), "rounded-md py-2")} // FIXME
                    value={tags}
                    onChange={setTags} // TODO option for Rep training link and callback for the value changing to add last section for in-person
                    selectFirstItem={false}
                    defaultOptions={ALL_BADGES.map((tag) => ({ label: tag, value: tag }))}
                    placeholder="Select training flags..."
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                      </p>
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <div className="text-right text-lg">Created: {data.created_at.toLocaleDateString()}</div>
                <div className="text-right text-lg">Last Updated: {data.updated_at.toLocaleDateString()}</div>
              </div>
            </div>
            <Separator />
            <br />
            Description:
            <PlateEditor
              className="z--10"
              toolbarClassName="z--10"
              placeholder="Type the training's description."
              initialValue={deserializeMd(data.description)}
            />
            <br />
          </div>
        </div>
      </div>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/_reponly/training/$id/edit")({
  component: Component,
});
