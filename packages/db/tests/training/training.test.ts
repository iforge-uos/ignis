import { seed } from "./seed.query";
import { expect, test } from "vitest";
import e from "../../edgeql-js";
import { createTransaction } from "../utils";
import { Transaction } from "gel/dist/transaction";
import { faker } from "@faker-js/faker";

const getUsers = async (tx: Transaction) => {
  const [userId, repId] = (
    await seed(tx, {
      user_email: faker.internet.email({ provider: "" }),
      rep_email: faker.internet.email({ provider: "" }),
      rep_ucard_number: Math.floor(Math.random() * 2 ** 32),
      user_ucard_number: Math.floor(Math.random() * 2 ** 32),
      user_username: faker.internet.username(),
      rep_username: faker.internet.username(),
    })
  ).map((user) => user.id);
  const user = e.assert_exists(
    e.select(e.users.User, () => ({
      filter_single: { id: userId },
    })),
  );
  const rep = e.assert_exists(
    e.select(e.users.Rep, () => ({
      filter_single: { id: repId },
    })),
  );
  return { user, rep };
};

test("training::get_expiry_dates", async () => {
  await using tx = await createTransaction({ config: { apply_access_policies: false } });
  const { user, rep } = await getUsers(tx);

  expect(await e.training.get_expiry_dates(user).run(tx)).toBe(10);

  //   expect(await e.select(users).run(tx)).toBe(2);
});

test("training::get_status", async () => {
  await using tx = await createTransaction({ config: { apply_access_policies: false } });
  const { user, rep } = await getUsers(tx);

  expect(await e.training.get_statuses({ collapsed: true }, user as any).run(tx)).toBe(10);
  expect(await e.training.get_statuses({ collapsed: false }, user as any).run(tx)).toBe(10);
  expect(await e.training.get_statuses({ collapsed: true }, rep as any).run(tx)).toBe(10);
  expect(await e.training.get_statuses({ collapsed: false }, rep as any).run(tx)).toBe(10);

});
