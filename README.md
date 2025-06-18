# chiwalator

## install

To run via cli, clone the repo and run:

```bash
cd cli
bun install
```

## usage:

```bash
Usage: bun run src/index.ts [mode]
Modes:
  refresh                - Refresh word map from 7tv
  translate [sentence]   - Setence you want to translate
```

## example
```
bun run src/index.ts translate this is bad
# gets turned into:
that are good
```