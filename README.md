# Ignis

[![Deploy](https://github.com/iforge-uos/ignis/actions/workflows/deploy.yml/badge.svg)](https://github.com/iforge-uos/ignis/actions/workflows/deploy.yml)

f̸̖̿i̵̲̐r̷̨̄e̶̢̓ ̵̛̭f̸̜̏o̴̺̊r̸̥̈ ̶̟̽ẗ̴̬́h̵̻͂ë̸̻́ ̴̭̍f̸̫̉î̷̖r̴̮͒e̷͈͑ ̵̦̚g̴͓̒o̶͝ͅd̷͇̀

DESCRIPTION COMING SOON

## Docker (this is old)

```bash
docker build . --target <anvil | forge> --tag <anvil | forge>:latest
docker run -p <hostport:containerport> <anvil | forge>:latest

e.g.

docker build . --target forge --tag forge:latest
docker run -p 5000:5000 forge:latest
```