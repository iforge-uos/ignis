import Title from "@/components/title";
import ActiveLocationSelector from "@/components/sign-in/ActiveLocationSelector";
import Loader from "@packages/ui/components/loader";

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
