import { CommandConfig, commandConfig } from "@/config/commands.tsx";
import { useOriginalUserRoles } from "@/lib/utils.ts";

export function useFilteredCommands() {
  const userRoles = useOriginalUserRoles();

  const filteredCommands = commandConfig.filter((command) => {
    if (!command.requiredRoles || command.requiredRoles.length === 0) {
      return true;
    }
    return command.requiredRoles.some((role) => userRoles.includes(role.toLowerCase()));
  });

  // Group commands by their group property
  return filteredCommands.reduce(
    (acc, command) => {
      if (!acc[command.group]) {
        acc[command.group] = [];
      }
      acc[command.group].push(command);
      return acc;
    },
    {} as Record<string, CommandConfig[]>,
  );
}
