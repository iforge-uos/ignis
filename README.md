# Ignis

[![Deploy](https://github.com/iforge-uos/ignis/actions/workflows/deploy.yml/badge.svg)](https://github.com/iforge-uos/ignis/actions/workflows/deploy.yml)

f̸̖̿i̵̲̐r̷̨̄e̶̢̓ ̵̛̭f̸̜̏o̴̺̊r̸̥̈ ̶̟̽ẗ̴̬́h̵̻͂ë̸̻́ ̴̭̍f̸̫̉î̷̖r̴̮͒e̷͈͑ ̵̦̚g̴͓̒o̶͝ͅd̷͇̀

DESCRIPTION COMING SOON

## Manual Install

Each [app](/apps) has installation instructions in its README.

## Docker Compose

```
# First create the secret dirs
mkdir -p ./config/secret/{db,op}

# Then create the cert
./scripts/gen-cert.sh

# Get the 1password-credentials.json and place it in ./config/secret/op

# Next gen the docker compose env from the template
pnpm env:gen

# Docker compose up
docker compose up -d
```