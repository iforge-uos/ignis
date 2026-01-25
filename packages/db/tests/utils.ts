import createClient, { SimpleConfig } from "gel"
import { Transaction } from "gel/dist/transaction";

const client = createClient({branch: "test"}).withGlobals({
    PUB_SUB_SECRET: "",
})

type CoolTransaction = Transaction & {[Symbol.asyncDispose]:  () => Promise<void>}

export const createTransaction = async ({config}: {config?: SimpleConfig} = {}): Promise<CoolTransaction> => {
    let resolveTx!: (x: Transaction) => void;
    let cleanupTx!: (x: undefined) => void;
    // biome-ignore lint/suspicious/noAssignInExpressions: it's cool
    const getTx = new Promise<Transaction>((resolve) => (resolveTx = resolve));
    // biome-ignore lint/suspicious/noAssignInExpressions: it's also cool
    const blocker = new Promise<undefined>((resolve) => (cleanupTx = resolve));

    client.withConfig(config ?? {}).transaction(async (tx) => {
        resolveTx(tx);
        await blocker;
    });

    return new Proxy(await getTx, {
        get(target, prop) {
            if (prop === Symbol.asyncDispose) {
                return cleanupTx;
            }
            return (target as any)[prop];
        }
    }) as CoolTransaction;
}