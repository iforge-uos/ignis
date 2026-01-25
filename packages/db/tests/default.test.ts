import { expect, test } from "vitest";
import e from "../edgeql-js"
import { createTransaction } from "./utils";

test("default::bin", async () => {
    await using tx = await createTransaction();
    expect(await e.bin("0000").run(tx)).toBe(0);
    expect(await e.bin("0001").run(tx)).toBe(1);
    expect(await e.bin("0_01_______0").run(tx)).toBe(2);

    expect(() =>  e.bin("fafasdfas").run(tx)).toThrow("invalid input syntax for type std::int64")
})


// test("default::zip", async () => {
//     await using tx = await createTransaction();
//     expect(await e.zip(["0000"], ["0001"]).run(tx)).toBe(...);
// })
