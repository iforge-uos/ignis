# Anvil

<div align="center"><img src="../mine/logos/anvil.png#gh-light-mode-only" height=300></div>
<div align="center"><img src="../mine/logos/anvil-dark.png#gh-dark-mode-only" height=300></div>

A [Nest](https://github.com/nestjs/nest) server for Forge's front end.

## Installation

### Prerequisites
1. You need the [1Password CLI](https://developer.1password.com/docs/cli/get-started) and have access to the IT Team Vault. Contact the team lead about that if you don't already have access.
2. You need to install [EdgeDB](https://docs.edgedb.com/get-started/quickstart).

```bash
$ edgedb project init
$ pnpm install
$ pnpm regen
$ pnpm seed
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
