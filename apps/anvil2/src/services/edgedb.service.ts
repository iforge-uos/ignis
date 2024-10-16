import { $infer, createClient } from "@dbschema/edgeql-js";
import * as T from "@dbschema/edgeql-js/typesystem";

export class EdgeDBService {
  private static instance: EdgeDBService;
  private client = createClient();
  private isConnected = false;

  private constructor() {}

  public static getInstance(): EdgeDBService {
    if (!EdgeDBService.instance) {
      EdgeDBService.instance = new EdgeDBService();
    }
    return EdgeDBService.instance;
  }

  public async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.client.ensureConnected();
      this.isConnected = true;
    }
  }

  public async query<Expr extends T.Expression>(expression: Expr): Promise<$infer<Expr>> {
    await this.ensureConnected();
    return await expression.run(this.client);
  }
}
