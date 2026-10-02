"""Post-generation patches for the generated query builder (edgeql-js).

`bun regen` overwrites everything in edgeql-js/, so any intentional change to generated code must live here or it
will be silently lost. Each patch is an (old, new) pair applied to one file. A patch is skipped if `new` is already
present (so re-running is safe), and the script fails loudly if neither `old` nor `new` can be found, which means
the generator output changed and the patch needs updating.
"""

import re
import sys
import time
from collections.abc import Callable
from pathlib import Path

ROOT = Path(__file__).parent
EDGEQL_JS = ROOT / "edgeql-js"

import_to_add = 'import { Temporal } from "@js-temporal/polyfill";'

Patch = tuple[str, str] | Callable[[str], tuple[str, str] | None]  # a callable returns None if it can't match


def sealed_dimensions() -> list[str]:
    return [
        f"${name}"
        for name in re.findall(
            r"type \$([A-Za-z]+) = ",
            (EDGEQL_JS / "modules" / "dimensions.ts").read_text(),
        )
    ]


def dimension_type_patch(_: str) -> tuple[str, str]:
    dimensions = sealed_dimensions()
    return (
        'export type $DimensionType = $.ScalarType<"std::json", unknown>;',
        f"""\
import {{ getPropsShape }} from "../path";
import {{ {", ".join(dimensions)} }} from "./dimensions";
export type SealedDimensions =
{"  \n".join(f'| {{__typename: {name}["__polyTypenames__"]}} & $.computeObjectShape<{name}["__pointers__"], Omit<getPropsShape<{name}>, "id" | "formatted">>' for name in dimensions)}
export type $DimensionType = $.ScalarType<"std::json", SealedDimensions & {{ fields: {{ name: string, required: boolean }}[] }}>;
        """,
    )


def union_overload_patch(content: str) -> tuple[str, str] | None:
    # `|` reuses the std::union overloads, so copy them rather than hardcoding generated type ids
    match = re.search(r'^    "union": \[\n.*?^    \],\n', content, re.MULTILINE | re.DOTALL)
    if match is None:
        return None
    union = match.group(0)
    return union, union + union.replace('"union"', '"|"', 1)


def merge_operator_patch(interface: str) -> Patch:
    # give `|` the same operand types as `union` (the generator emits `"union": ` with trailing whitespace)
    def patch(content: str) -> tuple[str, str] | None:
        match = re.search(
            rf'^interface {interface} {{\n  "union":[ \t]*\n(    \|[^\n]*\n)(  "\|":\n    \|[^\n]*\n)?}}', content, re.MULTILINE
        )
        if match is None:
            return None
        if match.group(2):  # already applied
            return match.group(0), match.group(0)
        return match.group(0), match.group(0)[: -len("}")] + f'  "|":\n{match.group(1)}}}'

    return patch


PATCHES: dict[str, list[Patch]] = {
    # dates and times are Temporal values across the codebase, see apps/forge/src/db.ts
    "modules/std.ts": [
        (
            'export type $datetime = $.ScalarType<"std::datetime", Date>;',
            'export type $datetime = $.ScalarType<"std::datetime", Temporal.ZonedDateTime>;',
        ),
        (
            'export type $duration = $.ScalarType<"std::duration", _.gel.Duration>;',
            'export type $duration = $.ScalarType<"std::duration", Temporal.Duration>;',
        ),
    ],
    "modules/std/cal.ts": [
        (
            'export type $local_date = $.ScalarType<"std::cal::local_date", _.gel.LocalDate>;',
            'export type $local_date = $.ScalarType<"std::cal::local_date", Temporal.PlainDate>;',
        ),
        (
            'export type $local_datetime = $.ScalarType<"std::cal::local_datetime", _.gel.LocalDateTime>;',
            'export type $local_datetime = $.ScalarType<"std::cal::local_datetime", Temporal.PlainDateTime>;',
        ),
        (
            'export type $local_time = $.ScalarType<"std::cal::local_time", _.gel.LocalTime>;',
            'export type $local_time = $.ScalarType<"std::cal::local_time", Temporal.PlainTime>;',
        ),
    ],
    "modules/shop.ts": [dimension_type_patch],
    "path.ts": [
        (
            'const typenameSymbol = Symbol("typename");',
            'export const typenameSymbol = Symbol("typename");',
        ),
    ],
    "group.ts": [
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
    ],
    # Callable params, from geldata/gel-js#1292 (b02fdcc6): `e.params({...}, ...)({ name })` can be nested in another
    # query, with the args bound inline as a WITH block.
    "params.ts": [
        (
            """\
  runJSON(cxn: Executor, args: paramsToParamArgs<Params>): Promise<string>;
};

export type $expr_WithParams<""",
            """\
  runJSON(cxn: Executor, args: paramsToParamArgs<Params>): Promise<string>;
};

type paramOrTsType<Type extends ParamType, Optional extends boolean> =
  | $expr_Param<string, Type, Optional>
  | Readonly<BaseTypeToTsType<Type, true>>;

type paramsToInputArgs<Params extends ParamsRecord> = {
  [key in keyof Params as Params[key] extends ParamType
    ? key
    : never]: Params[key] extends ParamType
    ? paramOrTsType<Params[key], false>
    : never;
} & {
  [key in keyof Params as Params[key] extends $expr_OptionalParam
    ? key
    : never]?: Params[key] extends $expr_OptionalParam
    ? paramOrTsType<Params[key]["__type__"], true>
    : never;
};

type CallableWithParamsExpr<
  Params extends ParamsRecord = Record<string, never>,
  Expr extends TypeSet = TypeSet,
> = {
  (args: paramsToInputArgs<Params>): Expression<{
    __element__: Expr["__element__"];
    __cardinality__: Expr["__cardinality__"];
  }>;
};
export type $expr_WithParams<""",
        ),
        (
            """\
    __params__: $expr_Param[];
  },
  Params
>;
""",
            """\
    __params__: $expr_Param[];
  },
  Params
> &
  CallableWithParamsExpr<Params, Expr>;
""",
        ),
        (
            """\
  return $expressionify({
    __kind__: ExpressionKind.WithParams,
    __element__: returnExpr.__element__,
    __cardinality__: returnExpr.__cardinality__,
    __expr__: returnExpr,
    __params__: Object.values(paramExprs),
  }) as any;
}""",
            """\
  const withParamsExpr = $expressionify({
    __kind__: ExpressionKind.WithParams,
    __element__: returnExpr.__element__,
    __cardinality__: returnExpr.__cardinality__,
    __expr__: returnExpr,
    __params__: Object.values(paramExprs),
  }) as any;

  const callableExpr = function (args: paramsToInputArgs<Params>) {
    return $expressionify({
      __kind__: ExpressionKind.WithParams,
      __element__: returnExpr.__element__,
      __cardinality__: returnExpr.__cardinality__,
      __expr__: returnExpr,
      __params__: Object.values(paramExprs),
      __args__: args,
    }) as any;
  };

  Object.assign(callableExpr, withParamsExpr);

  return callableExpr as any;
}""",
        ),
    ],
    "toEdgeQL.ts": [
        # callable params (b02fdcc6)
        (
            """\
    case ExpressionKind.WithParams: {
      if (parentScope !== null) {
        throw new Error(
          `'withParams' does not support being used as a nested expression`,
        );
      }""",
            """\
    case ExpressionKind.WithParams: {
      // if (parentScope !== null) {
      //   throw new Error(
      //     `'withParams' does not support being used as a nested expression`,
      //   );
      // }""",
        ),
        (
            """\
  } else if (expr.__kind__ === ExpressionKind.WithParams) {
    return `(WITH\\n${expr.__params__""",
            """\
  } else if (expr.__kind__ === ExpressionKind.WithParams) {
    if ((expr as any).__args__) {
      const argList = Object.entries((expr as any).__args__)
        .map(([key, value]) => {
          if (
            value &&
            typeof value === "object" &&
            (value as any).__kind__ === ExpressionKind.Param
          ) {
            return `  __param__${key} := ${renderEdgeQL(value as any, ctx)}`;
          }
          const param = expr.__params__.find(
            (p: any) => p.__name__ === key,
          ) as any;
          return `  __param__${key} := ${literalToEdgeQL(param.__element__, value)}`;
        })
        .join(",\\n");

      return `(WITH\\n${argList}\\nSELECT ${renderEdgeQL(expr.__expr__, ctx)})`;
    }
    return `(WITH\\n${expr.__params__""",
        ),
        (
            'throw new Error(`Invalid shape element at "${key}".`);',
            'throw new Error(`Invalid shape element at "${key}" ${val}.`);',
        ),
        # `|` type union operator (60085936)
        (
            """\
          return `${renderEdgeQL(args[0]!, ctx)}[${index}]`;
        }
        return `(""",
            """\
          return `${renderEdgeQL(args[0]!, ctx)}[${index}]`;
        }
        if (operator === "|") {
          return `(${renderEdgeQL(args[0]!, ctx, false)} | ${renderEdgeQL(args[1]!, ctx, false)})`;
        }
        return `(""",
        ),
    ],
    # `|` type union operator (60085936), e.g. `e.cast(e.op(e.tools.Tool, "|", e.tools.GroupedTool), id)`
    "funcops.ts": [
        (
            '} else if (funcName === "union") {',
            '} else if (funcName === "union" || funcName === "|") {',
        ),
    ],
    "hydrate.ts": [
        (
            '`${A["__name__"]} UNION ${B["__name__"]}`,',
            '`${A["__name__"]} | ${B["__name__"]}`,',
        ),
        (
            "__name__: `${a.__name__} UNION ${b.__name__}`,",
            "__name__: `${a.__name__} | ${b.__name__}`,",
        ),
    ],
    "operators.ts": [
        union_overload_patch,
        merge_operator_patch("InfixBaseTypeMergeOperators"),
        merge_operator_patch("InfixMergeOperators"),
        (
            """\
    if (!defs) {
      throw new Error(`No operator exists with signature: ${args.map(arg => `${arg}`).join(", ")}`);
    }
""",
            """\
    if (!defs && op === "|") {
      defs = overloadDefs.Infix.union;
    }

    if (!defs) {
      throw new Error(`No operator exists with signature: ${args.map(arg => `${arg}`).join(", ")}`);
    }

  if (op === "|" && params.length === 2) {
    const leftType = params[0]?.__element__ ?? params[0];
    const rightType = params[1]?.__element__ ?? params[1];

    if (
      leftType?.__kind__ === $.TypeKind.object &&
      rightType?.__kind__ === $.TypeKind.object
    ) {
      const leftName = leftType.__name__;
      const rightName = rightType.__name__;
    const unionType = Array.from(_.spec.values()).find((type: any) => {
      if (type.kind !== "object" || !type.union_of?.length) return false;
      const unionNames = type.union_of.map(({ id }: { id: string }) => _.spec.get(id)?.name);
      return unionNames.length === 2 && unionNames.includes(leftName) && unionNames.includes(rightName);
    });

      if (unionType) {
        return _.syntax.$expressionify({
          __kind__: $.ExpressionKind.Operator,
          __element__: $.makeType(_.spec, unionType.id, _.syntax.literal),
          __cardinality__: params[0].__cardinality__ === $.Cardinality.Many || params[1].__cardinality__ === $.Cardinality.Many
            ? $.Cardinality.Many
            : params[0].__cardinality__ === $.Cardinality.AtLeastOne || params[1].__cardinality__ === $.Cardinality.AtLeastOne
              ? $.Cardinality.AtLeastOne
              : params[0].__cardinality__ === $.Cardinality.One || params[1].__cardinality__ === $.Cardinality.One
                ? $.Cardinality.One
                : params[0].__cardinality__ === $.Cardinality.AtMostOne || params[1].__cardinality__ === $.Cardinality.AtMostOne
                  ? $.Cardinality.AtMostOne
                  : $.Cardinality.Empty,
          __name__: op,
          __opkind__: "Infix",
          __args__: params,
        }) as any;
      }
    }
  }
""",
        ),
    ],
}


def add_temporal_import(content: str) -> str:
    if "Temporal." not in content or import_to_add in content:
        return content

    lines = content.splitlines()
    import_insertion_point = -1
    in_import = False
    for i, line in enumerate(lines):
        if line.strip().startswith("import "):
            in_import = True
        # insert after the end of the statement, not inside a multi-line `import {`
        if in_import and line.rstrip().endswith(";"):
            import_insertion_point = i
            in_import = False

    if import_insertion_point == -1:  # if no imports, add at the top
        return f"{import_to_add}\n{content}"
    lines.insert(import_insertion_point + 1, import_to_add)
    return "\n".join(lines) + ("\n" if content.endswith("\n") else "")


def apply_patches(path: Path, patches: list[Patch]) -> list[str]:
    content = orig = path.read_text()
    failures = []

    for i, patch in enumerate(patches):
        resolved = patch(content) if callable(patch) else patch
        if resolved is None:
            failures.append(f"{path.relative_to(ROOT)}: patch #{i} ({patch.__name__}) not found")
            continue
        old, new = resolved
        if new in content:
            continue  # already applied
        if content.count(old) != 1:
            found = "not found" if old not in content else f"found {content.count(old)} times"
            failures.append(f"{path.relative_to(ROOT)}: patch #{i} {found}:\n{old[:300]}")
            continue
        content = content.replace(old, new)

    content = add_temporal_import(content)

    if content != orig:
        path.write_text(content, encoding="utf-8")
        print(f"Updated {path.relative_to(ROOT)}")
    return failures


def main():
    """Main function to run the script."""
    time.sleep(10)  # let schema generation finish
    print("Patching generated edgeql-js...")

    failures = [failure for file, patches in PATCHES.items() for failure in apply_patches(EDGEQL_JS / file, patches)]
    if failures:
        print("\nThe generated code changed and these patches no longer apply, update them in patch_edgeql_js.py:")
        print("\n\n".join(failures))
        sys.exit(1)

    print("Finished patching edgeql-js")


if __name__ == "__main__":
    main()
