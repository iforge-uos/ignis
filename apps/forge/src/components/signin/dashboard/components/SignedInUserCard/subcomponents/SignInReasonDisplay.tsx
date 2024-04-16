import { PartialReason } from "@ignis/types/sign_in.ts";
import { Badge } from "@ui/components/ui/badge.tsx";

interface SignInReasonDisplayProps {
  tools: string[];
  reason: PartialReason;
}

export const SignInReasonDisplay: React.FC<SignInReasonDisplayProps> = ({ tools, reason }) => {
  return (
    <>
      <div className="my-4 px-4 py-3 bg-accent dark:bg-neutral-800 rounded-lg">
        <div className="border-gray-500 p-2 rounded-lg mb-2">
          <div className="border-b border-gray-500 pb-2 font-medium mb-1 text-center font-mono">Sign In Reason</div>
          <div className="text-center font-mono ">{reason.name}</div>
        </div>
        <div className="border-gray-500 p-2 rounded-lg mb-4">
          <div className="border-b border-gray-500 pb-2  font-medium mb-1 text-center font-mono">Tools Used</div>
          <div className="flex flex-wrap gap-1">
            {tools.map((tool) => (
              <Badge variant="default" className="max-w-48 rounded-sm">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
