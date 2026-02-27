# publiccode-tools

Verktygskedja for `publiccode.yml` - standarden for att beskriva oppen kallkod i offentlig sektor.

## Vad ar publiccode.yml?

[publiccode.yml](https://docs.italia.it/italia/developers-italia/publiccodeyml/en/master/) ar en metadatastandard for mjukvarurepositorier i offentlig sektor. Filen placeras i rotmappen pa ett Git-repo och gor mjukvaran maskinlasbar och sokbar.

## DIS-Readiness Score

DIS-Tools bedomerhur val forberedd en publiccode.yml ar for DIS (Dynamiskt Inkopssystem for digitala tjanster). Poangen (0-100) baseras pa:

| Kategori | Max | Beskrivning |
|----------|-----|-------------|
| Obligatoriska falt | 40p | name, url, license, categories, etc. |
| Dokumentation | 20p | longDescription, screenshots, features |
| Lokalisering | 15p | Svenska beskrivningar |
| Underhall | 15p | maintenance.type, contacts |
| DIS-specifikt | 10p | DIS Fas 1-kategorier |

## Paket

| Paket | Beskrivning | npm |
|-------|-------------|-----|
| [@dis-tools/core](./packages/core) | Karnbibliotek for validering och scoring | [![npm](https://img.shields.io/npm/v/@dis-tools/core)](https://www.npmjs.com/package/@dis-tools/core) |
| [@dis-tools/cli](./packages/cli) | CLI-verktyg (`pcode`) | [![npm](https://img.shields.io/npm/v/@dis-tools/cli)](https://www.npmjs.com/package/@dis-tools/cli) |
| [@dis-tools/action](./packages/action) | GitHub Action | - |
| [@dis-tools/web](./packages/web) | Webbredaktorn | - |

## Snabbstart

### CLI

```bash
# Installera globalt
npm install -g @dis-tools/cli

# Skapa en ny publiccode.yml
pcode init

# Validera
pcode validate

# Berakna DIS-Readiness Score
pcode score --detailed

# Kolla ett GitHub-repo
pcode check Cetriq/publiccode-tools
```

### GitHub Action

```yaml
# .github/workflows/publiccode.yml
name: Validate publiccode.yml

on:
  push:
    paths: ['publiccode.yml']
  pull_request:
    paths: ['publiccode.yml']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Cetriq/publiccode-tools@v1
        with:
          min-score: 60
```

### Core-biblioteket

```typescript
import { validate, scoreYaml } from '@dis-tools/core';
import fs from 'fs';

const yaml = fs.readFileSync('publiccode.yml', 'utf-8');

// Validera
const result = validate(yaml, { lang: 'sv' });
console.log(result.valid); // true/false
console.log(result.errors); // []
console.log(result.warnings); // []

// Berakna poang
const score = scoreYaml(yaml, { lang: 'sv' });
console.log(score.total); // 0-100
console.log(score.breakdown); // { requiredFields, documentation, ... }
console.log(score.suggestions); // [ { message, potentialPoints } ]
```

## Utveckling

```bash
# Klona
git clone https://github.com/Cetriq/publiccode-tools.git
cd publiccode-tools

# Installera dependencies
pnpm install

# Bygg alla paket
pnpm build

# Kor tester
pnpm test

# Starta webbutvecklingsserver
pnpm --filter @dis-tools/web dev
```

## DIS Fas 1-kategorier

Dessa 9 kategorier ar prioriterade i DIS-initiativet:

- `CASE_MANAGEMENT` - Arendehantering
- `CIVIC_ENGAGEMENT` - Medborgarengagemang
- `DATA_ANALYTICS` - Dataanalys
- `DOCUMENT_MANAGEMENT` - Dokumenthantering
- `IDENTITY_MANAGEMENT` - Identitetshantering
- `LOCAL_GOVERNMENT` - Kommunal forvaltning
- `PUBLIC_PARTICIPATION` - Medborgardeltagande
- `REPORTING_ISSUES` - Felanmalan
- `WORKFLOW_MANAGEMENT` - Arbetsfloden

## Licens

Apache-2.0

## Bidra

Pull requests valkommen! Se [CONTRIBUTING.md](./CONTRIBUTING.md) for riktlinjer.

---

Byggt med hjarta for svensk offentlig sektor.
