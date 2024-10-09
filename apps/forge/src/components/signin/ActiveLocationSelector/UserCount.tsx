import React, { useState } from "react";

interface UserCountProps {
  rep_count: number;
  off_shift_rep_count: number;
  user_count: number;
  max_count: number;
}

export const UserCount: React.FC<UserCountProps> = ({ rep_count, off_shift_rep_count, max_count, user_count }) => {
  const [showDetails, setShowDetails] = useState(false);
  const total_count = rep_count + user_count;

  const handleClick = () => {
    setShowDetails(!showDetails);
  };

  const correctUserCount = user_count - off_shift_rep_count;

  return (
    <div
      className="rounded-sm flex bg-card text-card-foreground p-2 space-x-2 cursor-pointer"
      onClick={handleClick}
      onKeyUp={(event) => {
        // Handle the 'Enter' key to mimic mouse click interaction
        if (event.key === "Enter") {
          handleClick();
        }
      }}
    >
      {showDetails ? (
        <>
          <span> {rep_count}</span>
          <span className="text-gray-500 dark:text-gray-400 uppercase font-mono">rep(s)</span>
          <span>{off_shift_rep_count}</span>
          <span className="text-gray-500 dark:text-gray-400 uppercase font-mono">off-shift rep(s)</span>
          <span>{correctUserCount}</span>
          <span className="text-gray-500 dark:text-gray-400 uppercase font-mono">user(s)</span>
        </>
      ) : (
        <>
          <span className="text-gray-500 dark:text-gray-400 uppercase font-mono">user count</span>
          <span>
            {total_count}|{max_count}
          </span>
          <span className="text-gray-500 dark:text-gray-400 uppercase font-mono">max</span>
        </>
      )}
    </div>
  );
};
