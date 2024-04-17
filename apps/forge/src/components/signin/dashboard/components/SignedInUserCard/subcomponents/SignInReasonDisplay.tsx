import { PartialReason } from "@ignis/types/sign_in.ts";
import { Badge } from "@ui/components/ui/badge.tsx";

interface SignInReasonDisplayProps {
  tools: string[];
  reason: PartialReason;
}

export const SignInReasonDisplay: React.FC<SignInReasonDisplayProps> = ({ tools, reason }) => {
  return (
    <>
      <div className="my-4 px-4 py-3 bg-muted text-muted-foreground rounded-lg">
        <div className="border-gray-500 p-2 rounded-lg mb-2">
          <div className="pb-2 bg-card w-2/3 mr-auto ml-auto rounded-lg p-2 font-medium mb-1 text-center font-mono">
            Sign In Reason
          </div>
          <div className="text-center font-mono mt-2 justify-center">
            <Badge variant="default" className="max-w-48 rounded-sm">
              {reason.name}
            </Badge>
          </div>
        </div>
        <div className="border-gray-500 p-2 rounded-lg mb-4">
          <div className="pb-2 bg-card w-2/3 mr-auto ml-auto rounded-lg p-1 font-medium mb-1 text-center font-mono">
            Tools Used
          </div>
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {tools.map((tool) => (
              <Badge variant="default" className="max-w-48 rounded-lg">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
