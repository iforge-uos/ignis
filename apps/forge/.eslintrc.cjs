/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve('@ignis/lint/vite')],
  root: true,
  parserOptions: {
    project: './tsconfig.json',
  },
};