import { PartialReason } from "@ignis/types/sign_in.ts";
import { Badge } from "@ui/components/ui/badge.tsx";

interface SignInReasonDisplayProps {
  tools: string[];
  reason: PartialReason;
}

export const SignInReasonDisplay: React.FC<SignInReasonDisplayProps> = ({ tools, reason }) => {
  return (
    <>
      <div className="my-4 p-4 bg-muted text-muted-foreground rounded-sm h-[90%]">
        <div className="border-gray-500 p-2 rounded-sm mb-2">
          <div className="pb-2 bg-card h-full w-2/3 mr-auto ml-auto rounded-lg p-2 font-medium mb-1 text-center font-mono">
            Sign In Reason
          </div>
          <div className="text-center font-mono mt-2 justify-center">
            <Badge variant="default" className="max-w-48 rounded-sm shadow-lg">
              {reason.name}
            </Badge>
          </div>
        </div>
        <div className="border-gray-500 p-2 rounded-sm mb-4">
          <div className="pb-2 bg-card w-2/3 mr-auto ml-auto rounded-sm p-1 font-medium mb-1 text-center font-mono">
            Tools Used
          </div>
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {tools.map((tool) => (
              <Badge variant="default" className="max-w-48 rounded-sm shadow-lg">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
