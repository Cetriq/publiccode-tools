# SamhällsKodex

Verktygskedja för `publiccode.yml` - standarden för att beskriva öppen källkod i offentlig sektor.

## Vad är publiccode.yml?

[publiccode.yml](https://docs.italia.it/italia/developers-italia/publiccodeyml/en/master/) är en metadatastandard för mjukvarurepositorier i offentlig sektor. Filen placeras i rotmappen på ett Git-repo och gör mjukvaran maskinläsbar och sökbar.

## SamhällsKodex Score

SamhällsKodex bedömer hur väl förberedd en publiccode.yml är för DIS (Dynamiskt Inköpssystem för digitala tjänster). Poängen (0-100) baseras på:

| Kategori | Max | Beskrivning |
|----------|-----|-------------|
| Obligatoriska fält | 40p | name, url, license, categories, etc. |
| Dokumentation | 20p | longDescription, screenshots, features |
| Lokalisering | 15p | Svenska beskrivningar |
| Underhåll | 15p | maintenance.type, contacts |
| DIS-specifikt | 10p | DIS Fas 1-kategorier |

## Paket

| Paket | Beskrivning | npm |
|-------|-------------|-----|
| [@samhallskodex/core](./packages/core) | Kärnbibliotek för validering och scoring | [![npm](https://img.shields.io/npm/v/@samhallskodex/core)](https://www.npmjs.com/package/@samhallskodex/core) |
| [@samhallskodex/cli](./packages/cli) | CLI-verktyg (`pcode`) | [![npm](https://img.shields.io/npm/v/@samhallskodex/cli)](https://www.npmjs.com/package/@samhallskodex/cli) |
| [@samhallskodex/action](./packages/action) | GitHub Action | - |
| @samhallskodex/web | Webbredaktören (privat) | - |

## Snabbstart

### CLI

```bash
# Installera globalt
npm install -g @samhallskodex/cli

# Skapa en ny publiccode.yml
pcode init

# Validera
pcode validate

# Beräkna SamhällsKodex Score
pcode score --detailed

# Kolla ett GitHub-repo
pcode check Cetriq/samhallskodex
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
      - uses: Cetriq/samhallskodex@v1
        with:
          min-score: 60
```

### Core-biblioteket

```typescript
import { validate, scoreYaml } from '@samhallskodex/core';
import fs from 'fs';

const yaml = fs.readFileSync('publiccode.yml', 'utf-8');

// Validera
const result = validate(yaml, { lang: 'sv' });
console.log(result.valid); // true/false
console.log(result.errors); // []
console.log(result.warnings); // []

// Beräkna poäng
const score = scoreYaml(yaml, { lang: 'sv' });
console.log(score.total); // 0-100
console.log(score.breakdown); // { requiredFields, documentation, ... }
console.log(score.suggestions); // [ { message, potentialPoints } ]
```

## Utveckling

```bash
# Klona
git clone https://github.com/Cetriq/samhallskodex.git
cd samhallskodex

# Installera dependencies
pnpm install

# Bygg alla paket
pnpm build

# Kör tester
pnpm test

# Starta webbutvecklingsserver
pnpm --filter @samhallskodex/web dev
```

## DIS Fas 1-kategorier

Dessa 9 kategorier är prioriterade i DIS-initiativet:

- `CASE_MANAGEMENT` - Ärendehantering
- `CIVIC_ENGAGEMENT` - Medborgarengagemang
- `DATA_ANALYTICS` - Dataanalys
- `DOCUMENT_MANAGEMENT` - Dokumenthantering
- `IDENTITY_MANAGEMENT` - Identitetshantering
- `LOCAL_GOVERNMENT` - Kommunal förvaltning
- `PUBLIC_PARTICIPATION` - Medborgardeltagande
- `REPORTING_ISSUES` - Felanmälan
- `WORKFLOW_MANAGEMENT` - Arbetsflöden

## Licens

Apache-2.0

## Bidra

Pull requests välkomna! Se [CONTRIBUTING.md](./CONTRIBUTING.md) för riktlinjer.

---

Byggt med kärlek för svensk offentlig sektor.
