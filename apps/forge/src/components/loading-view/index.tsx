import Title from "@/components/title";
import ActiveLocationSelector from "@/components/signin/actions/ActiveLocationSelector";
import {Loader} from "@ui/components/ui/loader.tsx";

const LoadingView = () => {
    return (
        <>
            <Title prompt="Signin Dashboard"/>
            <div className="p-4 mt-1">
                <ActiveLocationSelector/>
                <div className="border-2 p-4">
                    <Loader/>
                </div>
            </div>
        </>
    );
};

export default LoadingView;
