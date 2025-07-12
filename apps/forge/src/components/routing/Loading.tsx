import Title from "@/components/title";
import {Hammer} from "@/components/loading";

export const Loading = () => {
  return (
    <>
      <Title prompt="Loading..." />
      <div className="flex items-center justify-center w-full min-h-svh px-4">
        <div className="grid items-center gap-4 text-center">
          <div className="space-y-2">
            <Hammer />
          </div>
        </div>
      </div>
    </>
  );
};
