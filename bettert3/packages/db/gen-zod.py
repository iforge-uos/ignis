import re
import subprocess
from pathlib import Path

subprocess.run(["pnpm", "gel-zod", "--target=ts"], check=True)

for file in (Path(__file__).parent / "zod" / "modules").glob("*.ts"):
    print(f"Processing {file}")
    contents = orig = file.read_text()

    contents = re.sub(
        r"z\.iso\.datetime\({ offset: true }\)",
        'z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1_000_000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))])',
        contents,
    )
    contents = re.sub(
        r"z\.iso\.duration\(\)",
        "z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))])",
        contents,
    )

    # Process temporal types by performing a transform to their polyfilled types
    if orig != contents:
        contents = f"""\
import {{ Temporal }} from "@js-temporal/polyfill";
import {{ Duration }} from "gel";
{contents}
        """

    file.write_text(contents)

print("Successfully processed all Zod schema files")
