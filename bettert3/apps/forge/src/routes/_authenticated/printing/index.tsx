;
import Title from "@/components/title";
import { RouteUnfinished } from "@/components/routing/RouteUnfinished";

const PrintingAppIndexComponent = () => {
  return (
    <>
      <Title prompt="Printing App" />
      <div className="p-2">
        <h3>Printing App</h3>
      </div>
    </>
  );
};

export const Route = createFileRoute({ component: RouteUnfinished });
