import subprocess
import re
from pathlib import Path

subprocess.run(["pnpm", "gel-zod", "--target=ts"], check=True)

for file in (Path(__file__).parent / "zod" / "modules").glob("*.ts"):
    print(f"Processing {file}")
    contents = orig = file.read_text()

    contents = re.sub(
        r'z\.string\(\)\.datetime\({ offset: true }\)',
        'z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.string().datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))])',
        contents
    )
    contents = re.sub(
        r'z\.string\(\)\.duration\(\)',
        'z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.string().duration().transform((dur) => Temporal.Duration.from(dur)))])',
        contents
    )

    # Process temporal types by performing a transform to their polyfilled types
    if orig != contents:
        contents = f'''\
import {{ Temporal }} from "@js-temporal/polyfill";
import {{ Duration }} from "gel";
{contents}
        '''

    file.write_text(contents)

print("Successfully processed all Zod schema files")
