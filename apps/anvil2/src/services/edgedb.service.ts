import { $infer, createClient } from "@dbschema/edgeql-js";
import * as T from "@dbschema/edgeql-js/typesystem";

export class EdgeDBService {
  private static _instance: EdgeDBService;
  public client = createClient();
  private isConnected = false;

  private constructor() {}

  public static get instance(): EdgeDBService {
    if (!EdgeDBService._instance) {
      EdgeDBService._instance = new EdgeDBService();
    }
    return EdgeDBService._instance;
  }

  public async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.client.ensureConnected();
      this.isConnected = true;
    }
  }

  public static async query<Expr extends T.Expression>(expression: Expr): Promise<$infer<Expr>> {
    await EdgeDBService.instance.ensureConnected();
    return await expression.run(EdgeDBService.instance.client);
  }

  public static async queryJSON<Expr extends T.Expression>(expression: Expr): Promise<$infer<Expr>> {
    await EdgeDBService.instance.ensureConnected();
    return await expression.runJSON(EdgeDBService.instance.client);
  }
}
