# @samhallskodex/cli

CLI-verktyg för att skapa, validera och poängsätta `publiccode.yml`-filer enligt SamhällsKodex-standarden för svensk offentlig sektor.

## Installation

```bash
npm install -g @samhallskodex/cli
```

Eller med pnpm:

```bash
pnpm add -g @samhallskodex/cli
```

## Kommandon

### `pcode init`

Interaktiv wizard för att skapa en ny `publiccode.yml`:

```bash
pcode init
pcode init -o min-publiccode.yml  # Ange output-fil
pcode init --lang en              # Engelska prompts
```

### `pcode validate`

Validera en `publiccode.yml`-fil mot schemat:

```bash
pcode validate                    # Validerar ./publiccode.yml
pcode validate path/to/file.yml   # Validera specifik fil
pcode validate --strict           # Behandla varningar som fel
pcode validate --format json      # JSON-output
```

**Exempel output:**

```
✓ Validering lyckades!

Varningar (2):
  • maintenance: Lägg till underhållsinformation
    → Lägg till maintenance.type och maintenance.contacts
  • softwareVersion: Lägg till softwareVersion
```

### `pcode score`

Beräkna DIS-Readiness Score (0-100):

```bash
pcode score                       # Poängsätt ./publiccode.yml
pcode score path/to/file.yml      # Poängsätt specifik fil
pcode score --detailed            # Visa detaljerad uppdelning
pcode score --json                # JSON-output
pcode score --badge               # Generera badge-URL
```

**Exempel output:**

```
DIS-Readiness Score: 85/100
██████████████████████████████████░░░░░░

Poänguppdelning:
  Obligatoriska fält: 40/40
    ✓ name: 5/5
    ✓ url: 5/5
    ...
  Dokumentation: 15/20
    ✓ longDescription: 5/5
    ✗ screenshots: 0/5
    ...

Förbättringsförslag:
  ! Lägg till screenshots (+5 poäng)
  • Lägg till en dokumentations-URL (+5 poäng)
```

### `pcode categories`

Lista och sök bland kategorier:

```bash
pcode categories                  # Lista alla 52 kategorier
pcode categories --dis-fase1      # Visa endast DIS Fas 1-kategorier
pcode categories --search "ärende" # Sök i kategorier
pcode categories --json           # JSON-output
```

**Exempel output:**

```
DIS Fas 1-kategorier:

  CASE_MANAGEMENT [DIS Fas 1]
    Ärendehantering
    System för hantering av ärenden och kundinteraktioner

  CIVIC_ENGAGEMENT [DIS Fas 1]
    Medborgarengagemang
    Verktyg för medborgardeltagande och engagemang
  ...
```

## Globala flaggor

| Flagga | Beskrivning | Default |
|--------|-------------|---------|
| `-l, --lang <lang>` | Språk för output (sv/en) | `sv` |
| `-V, --version` | Visa versionsnummer | - |
| `-h, --help` | Visa hjälp | - |

## DIS-Readiness Score

Poängen baseras på fem kategorier:

| Kategori | Max poäng | Beskrivning |
|----------|-----------|-------------|
| Obligatoriska fält | 40 | name, url, license, etc. |
| Dokumentation | 20 | longDescription, screenshots, features |
| Lokalisering | 15 | Svenska beskrivningar och kontakter |
| Underhåll | 15 | maintenance.type, contacts, releaseDate |
| DIS-specifikt | 10 | DIS Fas 1-kategorier, dependencies |

### Poängnivåer

- **80-100**: Utmärkt - redo för DIS-katalogen
- **60-79**: Bra - några förbättringar rekommenderas
- **40-59**: Acceptabel - behöver mer arbete
- **0-39**: Otillräcklig - saknar viktiga fält

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

## Exempel: Komplett arbetsflöde

```bash
# 1. Skapa en ny publiccode.yml interaktivt
pcode init

# 2. Validera filen
pcode validate

# 3. Kontrollera poängen
pcode score --detailed

# 4. Hitta rätt kategorier
pcode categories --search "dokument"

# 5. Redigera filen och validera igen
pcode validate --strict
```

## Användning i CI/CD

```yaml
# .github/workflows/publiccode.yml
name: Validate publiccode.yml
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @samhallskodex/cli
      - run: pcode validate --strict
      - run: pcode score
```

> Tips: Använd [Cetriq/samhallskodex](https://github.com/Cetriq/samhallskodex) GitHub Action för enklare integration med PR-annotationer!

## Relaterade paket

- [`@samhallskodex/core`](https://www.npmjs.com/package/@samhallskodex/core) - Kärnbibliotek för validering och scoring
- [GitHub Action](https://github.com/Cetriq/samhallskodex) - GitHub Action för automatisk validering

## Licens

Apache-2.0
