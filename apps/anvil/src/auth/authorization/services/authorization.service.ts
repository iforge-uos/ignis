import { AbilityBuilder, PureAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { EdgeDBService } from "@/edgedb/edgedb.service";

@Injectable()
export class AuthorizationService {
  constructor(private readonly dbService: EdgeDBService) {}

  async defineAbilitiesFor(user: { id: string }) {
    const { can, build } = new AbilityBuilder(PureAbility);

    return build();
  }
}
// function AbilityFactory():
//   | import("@casl/ability/dist/types/types").AnyClass<AppAbility>
//   | ((rules?: any[] | undefined, options?: any) => AppAbility) {
//   throw new Error("Function not implemented.");
// }
