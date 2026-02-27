# @dis-tools/action

GitHub Action för att validera och poängsätta `publiccode.yml`-filer enligt DIS-standarden (Digital Infrastruktur för Samhällsservice).

## Funktioner

- **Validering** mot publiccode.yml-schemat
- **DIS-Readiness Score** (0-100) med detaljerad uppdelning
- **PR-annotationer** för fel och varningar direkt i koden
- **Job Summary** med tabeller och förbättringsförslag
- **Konfigurerbar** med min-score, fail-on-warnings, språk
- **Svenska och engelska** meddelanden

## Snabbstart

```yaml
# .github/workflows/publiccode.yml
name: Validate publiccode.yml

on:
  push:
    paths:
      - 'publiccode.yml'
  pull_request:
    paths:
      - 'publiccode.yml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Cetriq/publiccode-tools@v1
```

## Inputs

| Input | Beskrivning | Default |
|-------|-------------|---------|
| `path` | Sökväg till publiccode.yml | `./publiccode.yml` |
| `fail-on-warnings` | Misslyckas om varningar hittas | `false` |
| `min-score` | Minsta godkända DIS-Readiness Score (0-100) | `0` |
| `annotate` | Skapa PR-annotationer | `true` |
| `lang` | Språk för meddelanden (sv/en) | `sv` |

## Outputs

| Output | Beskrivning |
|--------|-------------|
| `valid` | `true` om filen är giltig |
| `score` | DIS-Readiness Score (0-100) |
| `errors` | Antal valideringsfel |
| `warnings` | Antal varningar |

## Exempel

### Enkel validering

```yaml
- uses: Cetriq/publiccode-tools@v1
```

### Med minimum score

```yaml
- uses: Cetriq/publiccode-tools@v1
  with:
    min-score: 60
```

Misslyckas om DIS-Readiness Score är under 60.

### Strikt validering

```yaml
- uses: Cetriq/publiccode-tools@v1
  with:
    fail-on-warnings: true
```

Misslyckas även om det finns varningar (inte bara fel).

### Anpassad sökväg

```yaml
- uses: Cetriq/publiccode-tools@v1
  with:
    path: ./docs/publiccode.yml
```

### Engelska meddelanden

```yaml
- uses: Cetriq/publiccode-tools@v1
  with:
    lang: en
```

### Använd outputs

```yaml
- uses: Cetriq/publiccode-tools@v1
  id: publiccode

- name: Check score
  run: |
    echo "Score: ${{ steps.publiccode.outputs.score }}"
    echo "Valid: ${{ steps.publiccode.outputs.valid }}"
```

### Komplett exempel

```yaml
name: publiccode.yml CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate publiccode.yml
        uses: Cetriq/publiccode-tools@v1
        id: publiccode
        with:
          min-score: 60
          fail-on-warnings: false
          lang: sv

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## DIS-Readiness Score: ${{ steps.publiccode.outputs.score }}/100\n\nValidering: ${{ steps.publiccode.outputs.valid == 'true' && '✅ Godkänd' || '❌ Misslyckad' }}`
            })
```

## Job Summary

Action skapar en detaljerad sammanfattning som visas i GitHub Actions:

| Status | Fil | DIS-Readiness Score |
|--------|-----|---------------------|
| Godkänd | ./publiccode.yml | 🟢 85/100 |

### Poänguppdelning

| Kategori | Poäng |
|----------|-------|
| Obligatoriska fält | 40/40 |
| Dokumentation | 15/20 |
| Lokalisering | 15/15 |
| Underhåll | 10/15 |
| DIS-specifikt | 5/10 |

### Förbättringsförslag

- Lägg till screenshots (+5p)
- Uppdatera releaseDate (+5p)

## PR-annotationer

Fel och varningar visas direkt i PR-diffen:

```
❌ Valideringsfel: Obligatoriskt fält 'name' saknas
⚠️ Varning: Lägg till underhållsinformation
```

## DIS-Readiness Score

Poängen baseras på fem kategorier:

| Kategori | Max | Beskrivning |
|----------|-----|-------------|
| Obligatoriska fält | 40p | name, url, license, categories, etc. |
| Dokumentation | 20p | longDescription, screenshots, features |
| Lokalisering | 15p | Svenska beskrivningar och kontakter |
| Underhåll | 15p | maintenance.type, contacts, releaseDate |
| DIS-specifikt | 10p | DIS Fas 1-kategorier, dependencies |

### Rekommenderade nivåer

| Score | Nivå | Rekommendation |
|-------|------|----------------|
| 80-100 | 🟢 Utmärkt | Redo för DIS-katalogen |
| 60-79 | 🟡 Bra | Några förbättringar rekommenderas |
| 40-59 | 🟠 Acceptabel | Behöver mer arbete |
| 0-39 | 🔴 Otillräcklig | Saknar viktiga fält |

## Relaterade verktyg

- [`@godwana/publiccode-cli`](https://www.npmjs.com/package/@godwana/publiccode-cli) - CLI för lokal validering
- [`@godwana/publiccode-core`](https://www.npmjs.com/package/@godwana/publiccode-core) - Kärnbibliotek

## Licens

Apache-2.0
