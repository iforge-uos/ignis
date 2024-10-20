import Title from "@/components/title";
import { Loader } from "@ui/components/ui/loader.tsx";
import ActiveLocationSelector from "../sign-in/ActiveLocationSelector";

const LoadingView = () => {
  return (
    <>
      <Title prompt="Sign In Dashboard" />
      <div className="p-4 mt-1">
        <ActiveLocationSelector />
        <div className="border-2 p-4">
          <Loader />
        </div>
      </div>
    </>
  );
};

export default LoadingView;
