/**
 * x-samhallskodex Profile TypeScript types
 * Extension schema for Swedish public sector software metadata
 * Version: 0.1
 */

// ============================================================================
// Main Profile Interface
// ============================================================================

export interface XSamhallskodexProfile {
  profileVersion: ProfileVersion;
  architecture: Architecture;
  integration: Integration;
  ai: AI;
  quality?: Quality;
  governance: Governance;
}

export type ProfileVersion = '0.1';

// ============================================================================
// Architecture Types
// ============================================================================

export interface Architecture {
  ui: ArchitectureUI;
  ux?: ArchitectureUX;
  backend: ArchitectureBackend;
  deployment?: ArchitectureDeployment;
}

export interface ArchitectureUI {
  platform: UIPlatform;
  framework?: UIFramework;
  buildTool?: BuildTool;
  designSystem?: string;
}

export type UIPlatform = 'web' | 'desktop' | 'mobile' | 'cli' | 'api-only' | 'embedded';

export type UIFramework =
  | 'react'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'nextjs'
  | 'nuxt'
  | 'remix'
  | 'solid'
  | 'qwik'
  | 'htmx'
  | 'blazor'
  | 'wpf'
  | 'winforms'
  | 'swiftui'
  | 'flutter'
  | 'react-native'
  | 'electron'
  | 'tauri'
  | 'none'
  | 'other';

export type BuildTool =
  | 'vite'
  | 'webpack'
  | 'esbuild'
  | 'rollup'
  | 'parcel'
  | 'turbopack'
  | 'rspack'
  | 'none'
  | 'other';

export interface ArchitectureUX {
  rating?: Rating;
  accessibility?: Accessibility;
  mobileFriendly?: boolean;
}

export interface Accessibility {
  wcagLevel?: WCAGLevel;
}

export type WCAGLevel =
  | '2.0-A'
  | '2.0-AA'
  | '2.0-AAA'
  | '2.1-A'
  | '2.1-AA'
  | '2.1-AAA'
  | '2.2-A'
  | '2.2-AA'
  | '2.2-AAA'
  | 'unknown';

export interface ArchitectureBackend {
  architecture: BackendArchitecture;
  style?: BackendStyle;
  runtime?: Runtime;
  language?: ProgrammingLanguage;
  database?: Database;
}

export type BackendArchitecture = 'container' | 'vm' | 'serverless' | 'native' | 'mixed';

export type BackendStyle =
  | 'monolith'
  | 'modular-monolith'
  | 'microservice'
  | 'event-driven'
  | 'serverless'
  | 'mixed';

export type Runtime =
  | 'node'
  | 'deno'
  | 'bun'
  | 'dotnet'
  | 'jvm'
  | 'python'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'other';

export type ProgrammingLanguage =
  | 'typescript'
  | 'javascript'
  | 'csharp'
  | 'fsharp'
  | 'java'
  | 'kotlin'
  | 'scala'
  | 'python'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'other';

export interface Database {
  primary?: DatabaseType;
}

export type DatabaseType =
  | 'postgresql'
  | 'mysql'
  | 'mariadb'
  | 'sqlserver'
  | 'oracle'
  | 'mongodb'
  | 'dynamodb'
  | 'cosmosdb'
  | 'firebase'
  | 'supabase'
  | 'sqlite'
  | 'redis'
  | 'elasticsearch'
  | 'none'
  | 'other';

export interface ArchitectureDeployment {
  container?: ContainerTech;
  orchestration?: Orchestration;
  hosting?: HostingModel;
  iac?: IaCTool[];
}

export type ContainerTech = 'docker' | 'podman' | 'containerd' | 'oci' | 'none';

export type Orchestration =
  | 'kubernetes'
  | 'docker-compose'
  | 'docker-swarm'
  | 'nomad'
  | 'openshift'
  | 'ecs'
  | 'none'
  | 'other';

export type HostingModel = 'onprem' | 'private-cloud' | 'public-cloud' | 'hybrid';

export type IaCTool =
  | 'terraform'
  | 'pulumi'
  | 'ansible'
  | 'chef'
  | 'puppet'
  | 'cloudformation'
  | 'bicep'
  | 'cdk'
  | 'none'
  | 'other';

// ============================================================================
// Integration Types
// ============================================================================

export interface Integration {
  apiStyles: APIStyle[];
  protocols?: IntegrationProtocol[];
  identity?: IdentityMethod[];
  events?: EventIntegration;
  openApi?: OpenApiSpec;
}

export type APIStyle = 'rest' | 'graphql' | 'grpc' | 'soap' | 'odata' | 'websocket' | 'none';

export type IntegrationProtocol =
  | 'webhook'
  | 'mcp'
  | 'sftp'
  | 'ftp'
  | 'amqp'
  | 'mqtt'
  | 'kafka'
  | 'nats'
  | 'grpc-stream'
  | 'sse'
  | 'other';

export type IdentityMethod =
  | 'oidc'
  | 'oauth2'
  | 'saml'
  | 'ldap'
  | 'ad'
  | 'bankid'
  | 'freja'
  | 'eidas'
  | 'siths'
  | 'basic-auth'
  | 'api-key'
  | 'jwt'
  | 'none'
  | 'other';

export interface EventIntegration {
  enabled?: boolean;
  broker?: EventBroker;
}

export type EventBroker =
  | 'kafka'
  | 'rabbitmq'
  | 'redis-pubsub'
  | 'azure-service-bus'
  | 'aws-sqs'
  | 'aws-sns'
  | 'gcp-pubsub'
  | 'nats'
  | 'pulsar'
  | 'none'
  | 'other';

export interface OpenApiSpec {
  available?: boolean;
  url?: string;
}

// ============================================================================
// AI Types
// ============================================================================

export interface AI {
  enabled: boolean;
  useCases?: AIUseCase[];
  modelExecution?: ModelExecution;
  humanInLoop?: boolean;
  sensitiveDataHandling?: SensitiveDataHandling;
  decisionImpact?: DecisionImpact;
}

export type AIUseCase =
  | 'assistant'
  | 'chatbot'
  | 'summarization'
  | 'classification'
  | 'extraction'
  | 'translation'
  | 'transcription'
  | 'recommendation'
  | 'decision-support'
  | 'anomaly-detection'
  | 'forecasting'
  | 'image-recognition'
  | 'document-processing'
  | 'code-generation'
  | 'search'
  | 'other';

export interface ModelExecution {
  locality?: ModelLocality;
  providers?: AIProvider[];
}

export type ModelLocality = 'local' | 'cloud' | 'hybrid';

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'azure-openai'
  | 'google-vertex'
  | 'aws-bedrock'
  | 'huggingface'
  | 'local-llm'
  | 'mistral'
  | 'cohere'
  | 'other';

export type SensitiveDataHandling = 'none' | 'anonymized' | 'restricted' | 'full-access';

export type DecisionImpact = 'none' | 'advisory' | 'semi-automated' | 'automated';

// ============================================================================
// Quality Types
// ============================================================================

export interface Quality {
  uxRating?: Rating;
  apiMaturity?: Rating;
  documentationMaturity?: Rating;
  observability?: Rating;
  testCoverageLevel?: CoverageLevel;
  securityAudit?: SecurityAudit;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export type CoverageLevel = 'none' | 'low' | 'medium' | 'high';

export interface SecurityAudit {
  performed?: boolean;
  lastDate?: string;
}

// ============================================================================
// Governance Types
// ============================================================================

export interface Governance {
  opennessLevel: OpennessLevel;
  dataHosting?: DataHosting;
  auditability?: AuditabilityLevel;
  vendorDependency?: DependencyLevel;
  lockInRisk?: DependencyLevel;
  sourceAvailableToAuthority?: boolean;
  dataPortability?: DependencyLevel;
}

export type OpennessLevel = 'open-source' | 'open-core' | 'source-available' | 'proprietary';

export interface DataHosting {
  locality?: DataLocality;
  providers?: string[];
}

export type DataLocality = 'municipality' | 'sweden' | 'eu' | 'non-eu' | 'hybrid' | 'unknown';

export type AuditabilityLevel = 'low' | 'medium' | 'high';

export type DependencyLevel = 'low' | 'medium' | 'high';

// ============================================================================
// Utility Types for UI
// ============================================================================

/** All controlled values for UI platform select */
export const UI_PLATFORMS: UIPlatform[] = ['web', 'desktop', 'mobile', 'cli', 'api-only', 'embedded'];

/** All controlled values for UI framework select */
export const UI_FRAMEWORKS: UIFramework[] = [
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'remix', 'solid', 'qwik', 'htmx',
  'blazor', 'wpf', 'winforms', 'swiftui', 'flutter', 'react-native', 'electron', 'tauri',
  'none', 'other'
];

/** All controlled values for backend architecture select */
export const BACKEND_ARCHITECTURES: BackendArchitecture[] = ['container', 'vm', 'serverless', 'native', 'mixed'];

/** All controlled values for API styles select */
export const API_STYLES: APIStyle[] = ['rest', 'graphql', 'grpc', 'soap', 'odata', 'websocket', 'none'];

/** All controlled values for identity methods select */
export const IDENTITY_METHODS: IdentityMethod[] = [
  'oidc', 'oauth2', 'saml', 'ldap', 'ad', 'bankid', 'freja', 'eidas', 'siths',
  'basic-auth', 'api-key', 'jwt', 'none', 'other'
];

/** All controlled values for openness level select */
export const OPENNESS_LEVELS: OpennessLevel[] = ['open-source', 'open-core', 'source-available', 'proprietary'];

/** All controlled values for data locality select */
export const DATA_LOCALITIES: DataLocality[] = ['municipality', 'sweden', 'eu', 'non-eu', 'hybrid', 'unknown'];

/** All controlled values for AI use cases select */
export const AI_USE_CASES: AIUseCase[] = [
  'assistant', 'chatbot', 'summarization', 'classification', 'extraction',
  'translation', 'transcription', 'recommendation', 'decision-support',
  'anomaly-detection', 'forecasting', 'image-recognition', 'document-processing',
  'code-generation', 'search', 'other'
];

// ============================================================================
// Swedish Labels for UI
// ============================================================================

export const PROFILE_LABELS_SV: Record<string, string> = {
  // UI Platforms
  'web': 'Webb',
  'desktop': 'Desktop',
  'mobile': 'Mobil',
  'cli': 'Kommandorad (CLI)',
  'api-only': 'Endast API',
  'embedded': 'Inbäddat system',

  // Backend Architecture
  'container': 'Container',
  'vm': 'Virtuell maskin',
  'serverless': 'Serverlös',
  'native': 'Native/Binär',
  'mixed': 'Blandad',

  // API Styles
  'rest': 'REST',
  'graphql': 'GraphQL',
  'grpc': 'gRPC',
  'soap': 'SOAP',
  'odata': 'OData',
  'websocket': 'WebSocket',
  'none': 'Inget API',

  // Openness Levels
  'open-source': 'Öppen källkod',
  'open-core': 'Öppen kärna',
  'source-available': 'Källkod tillgänglig',
  'proprietary': 'Proprietär',

  // Data Locality
  'municipality': 'Kommun',
  'sweden': 'Sverige',
  'eu': 'EU',
  'non-eu': 'Utanför EU',
  'hybrid': 'Hybrid',
  'unknown': 'Okänd',

  // Levels
  'low': 'Låg',
  'medium': 'Medel',
  'high': 'Hög',

  // AI Locality
  'local': 'Lokalt',
  'cloud': 'Moln',

  // AI Use Cases
  'assistant': 'Assistent',
  'chatbot': 'Chattbot',
  'summarization': 'Sammanfattning',
  'classification': 'Klassificering',
  'extraction': 'Extraktion',
  'translation': 'Översättning',
  'transcription': 'Transkription',
  'recommendation': 'Rekommendation',
  'decision-support': 'Beslutsstöd',
  'anomaly-detection': 'Anomalidetektion',
  'forecasting': 'Prognostisering',
  'image-recognition': 'Bildigenkänning',
  'document-processing': 'Dokumentbehandling',
  'code-generation': 'Kodgenerering',
  'search': 'Sökning',

  // Identity
  'oidc': 'OpenID Connect',
  'oauth2': 'OAuth 2.0',
  'saml': 'SAML',
  'ldap': 'LDAP',
  'ad': 'Active Directory',
  'bankid': 'BankID',
  'freja': 'Freja eID',
  'eidas': 'eIDAS',
  'siths': 'SITHS',
  'basic-auth': 'Basic Auth',
  'api-key': 'API-nyckel',
  'jwt': 'JWT',
};
