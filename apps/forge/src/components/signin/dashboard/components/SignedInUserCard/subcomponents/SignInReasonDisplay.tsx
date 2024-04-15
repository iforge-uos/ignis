import { PartialReason } from "@ignis/types/sign_in.ts";

interface SignInReasonDisplayProps {
  tools: string[];
  reason: PartialReason;
}

export const SignInReasonDisplay: React.FC<SignInReasonDisplayProps> = ({ tools, reason }) => {
  return (
    <>
      <div className="my-4 px-4 py-3 bg-[#2b2b2b] rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Sign In Reason:</span>
          <span className="text-sm truncate max-w-[200px]">{reason.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Tools:</span>
          <span className="text-sm truncate max-w-[200px]">{tools.join(", ")}</span>
        </div>
      </div>
    </>
  );
};
