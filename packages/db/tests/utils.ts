import createClient, { SimpleConfig } from "gel"
import { Transaction } from "gel/dist/transaction";

const client = createClient({branch: "test"}).withGlobals({
    PUB_SUB_SECRET: "",
})

type CoolTransaction = Transaction & {[Symbol.asyncDispose]:  () => Promise<void>, rollback: () => Promise<void>}

export const createTransaction = async ({config}: {config?: SimpleConfig} = {}): Promise<CoolTransaction> => {
    let resolveTx!: (x: Transaction) => void;
    let cleanupTx!: (x: undefined) => void;
    const getTx = new Promise<Transaction>((resolve) => (resolveTx = resolve));
    const blocker = new Promise<undefined>((resolve) => (cleanupTx = resolve));
    const rollback = async () => {
        throw new Error("Rolling back transaction");
    };

    client.withConfig(config ?? {}).transaction(async (tx) => {
        resolveTx(tx);
        await blocker;
    });

    return new Proxy(await getTx, {
        get(target, prop) {
            if (prop === Symbol.asyncDispose) {
                return cleanupTx;
            }
            if (prop === "rollback") {
                return rollback;
            }
            return (target as any)[prop];
        }
    }) as CoolTransaction;
}