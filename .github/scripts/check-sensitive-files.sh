#!/usr/bin/env bash

set -euo pipefail

max_bytes=$((5 * 1024 * 1024))
violations=0

if [[ "${1:-}" == "--staged" ]]; then
  source_ref=:
  files_command=(git diff --cached --diff-filter=ACMR --name-only -z)
else
  base_ref=${1:?usage: check-sensitive-files.sh <base-ref> <head-ref>}
  head_ref=${2:?usage: check-sensitive-files.sh <base-ref> <head-ref>}

  if [[ "$base_ref" =~ ^0+$ ]]; then
    base_ref=$(git hash-object -t tree /dev/null)
  fi

  source_ref="${head_ref}:"
  files_command=(git diff --diff-filter=ACMR --name-only -z "$base_ref" "$head_ref")
fi

while IFS= read -r -d '' path; do
  filename=${path##*/}
  lowercase=$(printf '%s' "$filename" | tr '[:upper:]' '[:lower:]')

  case "$lowercase" in
    .env|.env.*)
      case "$lowercase" in
        *.example|*.sample|*.template|*.tpl) ;;
        *)
          printf 'Blocked environment file: %s\n' "$path" >&2
          violations=1
          ;;
      esac
      ;;
  esac

  case "$lowercase" in
    dump.*|*-dump.*|*_dump.*|backup.sql|backup.sql.*|*.dump|*.dump.*|*.sqlite|*.sqlite3)
      printf 'Blocked database-like file: %s\n' "$path" >&2
      violations=1
      ;;
  esac

  if size=$(git cat-file -s "${source_ref}${path}" 2>/dev/null) && ((size > max_bytes)); then
    printf 'Blocked file over 5 MiB (%s bytes): %s\n' "$size" "$path" >&2
    violations=1
  fi
done < <("${files_command[@]}")

if ((violations)); then
  printf '\nRefusing files that commonly contain secrets or generated data.\n' >&2
  printf 'Use an approved secret store, artifact storage, or Git LFS as appropriate.\n' >&2
  exit 1
fi
