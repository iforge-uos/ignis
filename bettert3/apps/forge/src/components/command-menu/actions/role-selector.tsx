import { adminOverwriteRoles, adminOverwrittenRoles } from "@/atoms/adminAtoms";
import { AVAILABLE_ROLES } from "@/lib/utils/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Label } from "@packages/ui/components/label";
import { MultiSelect } from "@packages/ui/components/multi-select";
import { Switch } from "@packages/ui/components/switch";
import { useAtom } from "jotai";
import { UserIcon } from "lucide-react";

export function RoleSelector() {
  const [selectedRoles, setSelectedRoles] = useAtom(adminOverwrittenRoles);
  const [overwriteRoles, setOverwriteRoles] = useAtom(adminOverwriteRoles);

  const roleOptions = AVAILABLE_ROLES.map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
    icon: UserIcon,
  }));

  const handleRoleChange = (newRoles: string[]) => {
    setSelectedRoles(newRoles);
  };

  const handleOverwriteToggle = (checked: boolean) => {
    setOverwriteRoles(checked);
    if (!checked) {
      setSelectedRoles([]);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin Role Selector</CardTitle>
        <CardDescription>Use this to change which role you view the site with.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch id="overwrite-roles" checked={overwriteRoles} onCheckedChange={handleOverwriteToggle} />
          <Label
            htmlFor="overwrite-roles"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Enable role overwriting
          </Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role-select" className="text-sm font-medium">
            Select Roles
          </Label>
          <MultiSelectFormField
            id="role-select"
            options={roleOptions}
            defaultValue={selectedRoles}
            onValueChange={handleRoleChange}
            placeholder="Select roles..."
            className="w-full"
            disabled={!overwriteRoles}
          />
        </div>
        {overwriteRoles && (
          <div className="text-sm text-muted-foreground">
            Selected role(s): {selectedRoles.length > 0 ? selectedRoles.join(", ") : "User"}
          </div>
        )}
        {!overwriteRoles && (
          <div className="p-2 bg-muted rounded-md text-sm text-muted-foreground">
            Role overwriting is disabled. Enable it to select custom roles.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
