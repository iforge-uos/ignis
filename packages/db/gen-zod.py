import re
import subprocess
from pathlib import Path

subprocess.run(["bunx", "gel-zod", "--target=ts"], check=True)

for file in (Path(__file__).parent / "zod" / "modules").glob("*.ts"):
    print(f"Processing {file}")
    contents = orig = file.read_text()
    contents = contents.replace(
        'import { z } from "zod";', 'import { z } from "zod/v4";'
    )

    #     contents = re.sub(
    #         re.escape("z.iso.datetime()"),
    #         'z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1_000_000), "UTC")), (z.date().transform((dt) => Temporal.ZonedDateTime.from(dt)))])',
    #         contents,
    #     )
    #     contents = re.sub(
    #         re.escape("z.iso.duration()"),
    #         "z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))])",
    #         contents,
    #     )

    #     # Process temporal types by performing a transform to their polyfilled types
    #     if orig != contents:
    #         contents = f"""\
    # import {{ Temporal }} from "@js-temporal/polyfill";
    # import {{ Duration }} from "gel";
    # {contents}
    #         """

    file.write_text(contents)

print("Successfully processed all Zod schema files")
