import e from "@dbschema/edgeql-js";
import { AbilityBuilder, PureAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { auth } from "@dbschema/interfaces";
import { EdgeDBService } from "@/edgedb/edgedb.service";

type AppAbility = PureAbility<
  [auth.PermissionAction | "READ_SELF", auth.PermissionSubject]
>;

@Injectable()
export class AuthorizationService {
  constructor(private readonly dbService: EdgeDBService) {}

  async defineAbilitiesFor(user: { id: string }): Promise<AppAbility> {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    // Fetch user and their roles with permissions
    const fetchedUser = await this.dbService.query(
        e.select(e.users.User, () => ({
          roles: {
            permissions: { subject: true, action: true },
          },
          filter_single: { id: user.id },
        }))
    );

    if (!fetchedUser) {
      return build();
    }


    // Flatten the permissions from all roles
    const allPermissions = fetchedUser.roles.flatMap(role => role.permissions);


    // Define abilities based on combined permissions
    allPermissions.forEach(permission => {
      can(permission.action, permission.subject);
    });

    return build();
  }
}
function AbilityFactory():
  | import("@casl/ability/dist/types/types").AnyClass<AppAbility>
  | ((rules?: any[] | undefined, options?: any) => AppAbility) {
  throw new Error("Function not implemented.");
}
