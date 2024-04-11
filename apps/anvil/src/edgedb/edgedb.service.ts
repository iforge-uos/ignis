import { $infer, createClient } from "@dbschema/edgeql-js";
import * as T from "@dbschema/edgeql-js/typesystem";
import { OnModuleInit } from "@nestjs/common";

export class EdgeDBService implements OnModuleInit {
  client = createClient();

  async onModuleInit() {
    await this.client.ensureConnected();
  }

  public async query<Expr extends T.Expression>(
    expression: Expr,
  ): Promise<$infer<Expr>> {
    return await expression.run(this.client);
  }
}
