import re
from pathlib import Path

ROOT = Path(__file__).parent

import_to_add = 'import { Temporal } from "@js-temporal/polyfill";'
sealed_dimensions: list[str] = [
    f"${name}"
    for name in re.findall(
        r"type \$([A-Za-z]+) = ",
        (ROOT / "edgeql-js" / "modules" / "shop" / "dimensions.ts").read_text(),
    )
]

REPLACEMENTS: list[tuple[str, str]] = [
    (
        'export type $datetime = $.ScalarType<"std::datetime", Date>;',
        'export type $datetime = $.ScalarType<"std::datetime", Temporal.ZonedDateTime>;',
    ),
    (
        'export type $duration = $.ScalarType<"std::duration", _.gel.Duration>;',
        'export type $duration = $.ScalarType<"std::duration", Temporal.Duration>;',
    ),
    (
        'export type $cal_local_date = $.ScalarType<"cal::local_date", _.gel.LocalDate>;',
        'export type $cal_local_date = $.ScalarType<"cal::local_date", Temporal.PlainDate>;',
    ),
    (
        'export type $cal_local_datetime = $.ScalarType<"cal::local_datetime", _.gel.LocalDateTime>;',
        'export type $cal_local_datetime = $.ScalarType<"cal::local_datetime", Temporal.PlainDateTime>;',
    ),
    (
        'export type $DimensionType = $.ScalarType<"std::json", unknown>;',
        f"""\
import {{ getPropsShape }} from "../path";
import {{ {", ".join(sealed_dimensions)} }} from "./shop/dimensions";
export type SealedDimensions =
{"  \n".join(f'| {{__typename: {name}["__polyTypenames__"]}} & $.computeObjectShape<{name}["__pointers__"], Omit<getPropsShape<{name}>, "id" | "formatted">>' for name in sealed_dimensions)}
export type $DimensionType = $.ScalarType<"std::json", SealedDimensions & {{ fields: {{ name: string, required: boolean }}[] }}>;
        """,
    ),
    (
        'const typenameSymbol = Symbol("typename");',
        'export const typenameSymbol = Symbol("typename");',
    ),
    (
        # Fix group.elements type to include shape information
        """\
      elements: LinkDesc<
        Expr["__element__"],
        Cardinality.Many,
        // todo check if this can be fixed better
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {},
        false,
        true,
        true,
        false
      >;""",
        """\
      // The elements link must include the full ObjectType with normaliseShape
      // to ensure proper type inference when selecting from group.elements.
      // Using Expr["__element__"] directly would lose shape information,
      // causing TypeScript to infer __element__: never in the callback scope.
      elements: LinkDesc<
        ObjectType<
          Expr["__element__"]["__name__"],
          Expr["__element__"]["__pointers__"],
          normaliseShape<Shape, "by">,
          Expr["__element__"]["__exclusives__"],
          Expr["__element__"]["__polyTypenames__"]
        >,
        Cardinality.Many,
        // todo check if this can be fixed better
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {},
        false,
        true,
        true,
        false
      >;""",
    ),
]


def apply_replacements(path: Path):
    content = orig = path.read_text()

    for old, new in REPLACEMENTS:
        content = content.replace(old, new)

    if content != orig:
        lines = content.splitlines()
        import_insertion_point = -1
        for i, line in enumerate(lines):
            if line.strip().startswith("import "):
                import_insertion_point = i

        if import_insertion_point != -1:
            lines.insert(import_insertion_point + 1, import_to_add)
            content = "\n".join(lines)
        else:  # if no imports, add at the top
            content = f"{import_to_add}\n{content}"

        path.write_text(content, encoding="utf-8")
        print(f"Updated {path}")


def main():
    """Main function to run the script."""
    print("Starting script to update temporal types...")

    apply_replacements(ROOT / "edgeql-js" / "modules" / "std.ts")
    apply_replacements(ROOT / "edgeql-js" / "modules" / "shop.ts")
    apply_replacements(ROOT / "edgeql-js" / "path.ts")
    apply_replacements(ROOT / "edgeql-js" / "group.ts")

    print("Finished updating temporal")


if __name__ == "__main__":
    main()
