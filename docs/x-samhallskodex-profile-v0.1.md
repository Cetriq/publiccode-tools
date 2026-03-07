# x-samhallskodex Profile Specification v0.1

## Overview

The `x-samhallskodex` profile is a modular extension to the standard `publiccode.yml` format. It provides detailed technical metadata specifically designed for Swedish public sector software projects.

This profile enables:
- Standardized technical architecture documentation
- AI/ML capability declarations
- Integration method specifications
- Governance and data locality information

## Usage

Add the `x-samhallskodex` section to your `publiccode.yml` file:

```yaml
publiccodeYmlVersion: '0.4'
name: My Project
url: https://github.com/example/my-project
# ... standard publiccode.yml fields ...

x-samhallskodex:
  profileVersion: '0.1'
  architecture:
    ui:
      platform: web
      framework: React
    backend:
      architecture: container
      runtime: Node.js
  integration:
    apiStyles:
      - rest
      - graphql
    identity:
      - bankid
      - oidc
  ai:
    enabled: true
    useCases:
      - chatbot
      - summarization
    humanInLoop: true
  governance:
    opennessLevel: open-source
    dataHosting:
      locality: sweden
```

## Schema Structure

### Required Fields (Base Level)

The following 6 fields are required for a valid profile:

1. `profileVersion` - Version of the profile specification
2. `architecture.ui.platform` - UI delivery platform
3. `architecture.backend.architecture` - Backend deployment model
4. `integration.apiStyles` - At least one API style
5. `ai.enabled` - Whether AI functionality is used
6. `governance.opennessLevel` - Code/license openness level

### Profile Sections

#### 1. `profileVersion` (required)

```yaml
profileVersion: '0.1'
```

Current version: `0.1`

#### 2. `architecture`

Technical architecture details.

```yaml
architecture:
  ui:
    platform: web           # required: web|desktop|mobile|cli|api|embedded|none|other
    framework: React        # optional: e.g., React, Vue, Angular, Flutter
    designSystem: string    # optional: design system used
    responsive: true        # optional: responsive design support
  backend:
    architecture: container # required: container|vm|serverless|native|mixed
    runtime: Node.js        # optional: e.g., Node.js, .NET, Java, Python
    database: PostgreSQL    # optional: primary database
  deployment:
    hosting: public-cloud   # optional: public-cloud|private-cloud|on-premise|hybrid
    containerTech: docker   # optional: docker|podman|containerd|oci|none
    orchestration: k8s      # optional: k8s|docker-swarm|nomad|openshift|none
    iaC: terraform          # optional: terraform|ansible|pulumi|cloudformation|bicep|arm|none|other
```

**UI Platform Values:**
- `web` - Web-based UI
- `desktop` - Desktop application
- `mobile` - Mobile app (iOS/Android)
- `cli` - Command-line interface
- `api` - Headless/API only
- `embedded` - Embedded system
- `none` - No user interface
- `other` - Other platform

**Backend Architecture Values:**
- `container` - Container-based
- `vm` - Virtual machine
- `serverless` - Function-as-a-Service
- `native` - Native/bare metal
- `mixed` - Mixed architecture

#### 3. `integration`

Integration capabilities and methods.

```yaml
integration:
  apiStyles:               # required: at least one
    - rest
    - graphql
  authProtocols:           # optional
    - oauth2
    - saml
  identity:                # optional
    - bankid
    - freja
    - oidc
  messageBrokers:          # optional
    - rabbitmq
    - kafka
  dataFormats:             # optional
    - json
    - xml
```

**API Style Values:**
- `rest` - REST API
- `graphql` - GraphQL
- `grpc` - gRPC
- `soap` - SOAP
- `odata` - OData
- `websocket` - WebSocket
- `none` - No API

**Identity Method Values:**
- `oidc` - OpenID Connect
- `oauth2` - OAuth 2.0
- `saml` - SAML
- `ldap` - LDAP
- `ad` - Active Directory
- `bankid` - Swedish BankID
- `freja` - Freja eID
- `eidas` - eIDAS
- `siths` - SITHS (Swedish healthcare)
- `basic-auth` - Basic Authentication
- `api-key` - API Key
- `jwt` - JWT
- `none` - No authentication
- `other` - Other method

#### 4. `ai`

AI/ML capabilities declaration.

```yaml
ai:
  enabled: true            # required: whether AI is used
  useCases:                # optional if enabled=false
    - chatbot
    - summarization
  humanInLoop: true        # recommended if enabled=true
  modelExecution:
    locality: cloud        # optional: local|cloud|hybrid
    providers:             # optional
      - openai
      - azure-openai
  sensitiveData: none      # optional: none|anonymized|restricted|full-access
  decisionImpact: advisory # optional: none|advisory|semi-automated|automated
```

**AI Use Case Values:**
- `assistant` - General AI assistant
- `chatbot` - Conversational interface
- `summarization` - Text summarization
- `classification` - Content classification
- `extraction` - Information extraction
- `translation` - Language translation
- `transcription` - Speech-to-text
- `recommendation` - Recommendation system
- `decision-support` - Decision support
- `anomaly-detection` - Anomaly detection
- `forecasting` - Predictive forecasting
- `image-recognition` - Image analysis
- `document-processing` - Document processing
- `code-generation` - Code generation
- `search` - Semantic search
- `other` - Other use case

#### 5. `quality`

Quality and maturity indicators.

```yaml
quality:
  uxRating: high          # optional: low|medium|high
  apiMaturity: high       # optional: low|medium|high
  documentationMaturity: medium  # optional: low|medium|high
  testCoverage: medium    # optional: none|low|medium|high
```

#### 6. `governance`

Governance and data handling.

```yaml
governance:
  opennessLevel: open-source    # required
  dataHosting:
    locality: sweden            # optional
    sovereignty: true           # optional
    certifications:             # optional
      - iso27001
      - soc2
  vendorDependency: low         # optional: none|low|medium|high
  exitStrategy: documented      # optional: none|partial|documented
  communityGovernance: true     # optional
```

**Openness Level Values:**
- `open-source` - Full open source
- `open-core` - Open core model
- `source-available` - Source available but restricted
- `proprietary` - Proprietary/closed source

**Data Locality Values:**
- `municipality` - Stored within municipality
- `sweden` - Stored in Sweden
- `eu` - Stored within EU
- `non-eu` - Stored outside EU
- `hybrid` - Multiple locations
- `unknown` - Unknown location

## Profile Score

The profile is scored separately from the main DIS-Readiness score. The Profile Score is calculated as a percentage (0-100%) based on the following weights:

| Section | Weight |
|---------|--------|
| profileVersion | 5% |
| architecture | 25% |
| integration | 20% |
| ai | 15% |
| quality | 15% |
| governance | 20% |

## CLI Usage

### Generate with Profile

```bash
pcode init --with-profile
```

This launches an interactive wizard that includes profile questions.

### Validate with Profile

```bash
pcode validate publiccode.yml
```

Profile validation is automatic when `x-samhallskodex` is present.

### Score with Profile

```bash
pcode score publiccode.yml --detailed
```

Shows both DIS-Readiness Score and Profile Score with breakdown.

## Web Editor

The web editor at `/editor` includes a "Profil" step (step 6) where you can:

1. Enable/disable the profile
2. Fill in architecture details
3. Select API styles and identity methods
4. Configure AI settings
5. Set governance options

The profile data is automatically included in the generated YAML.

## Validation

The profile is validated against a JSON Schema. Validation checks:

- Required fields are present
- Values match allowed enums
- Conditional requirements (e.g., `ai.useCases` when `ai.enabled: true`)

## Version History

- **v0.1** - Initial specification (2024)
  - Core architecture, integration, AI, quality, and governance sections
  - Separate scoring system
  - CLI and web editor support

## Future Considerations

Planned for future versions:

- Additional quality metrics (SLA, uptime)
- Compliance frameworks (GDPR specifics, NIS2)
- Inter-system communication patterns
- Deployment topology visualization
