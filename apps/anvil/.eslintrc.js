/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve("@ignis/lint/node")],
  root: true,
  parserOptions: {
    project: "./tsconfig.json",
  },
};
