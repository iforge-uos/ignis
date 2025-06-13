// import { createRAGClient } from "@gel/ai";f
// import { createClient } from "gel";
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// const client = createClient();

// const gpt4Ai = createRAGClient(client, {
//   model: "gpt-4o",
//   // model: "claude-3-5-haiku-latest",
// });

// const astronomyAi = gpt4Ai.withContext({
//   query: "ai_rep::Question",
// });

// console.log(
//   await astronomyAi.queryRag({
//     prompt: "iForge",
//     // temperature: 1,
//   }),
// );

// import e from "@db/edgeql-js";
// import { $User } from "@db/edgeql-js/modules/users";
// import { createClient } from "gel";
// import { introspect } from "gel/dist/reflection";

// const db = createClient().withConfig({ allow_user_specified_id: true });

// const user = e.delete(e.users.User, () => ({ filter_single: { id: "" } }));

// console.log((await introspect.types(db)).get($User.id));

function* foo() {
  const x = yield 1;
  if (x === undefined) throw "oh no";
  console.log(x);
}

const gen = foo();

console.log(gen.next());
