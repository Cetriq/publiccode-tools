/**
 * x-samhallskodex Profile TypeScript types
 * Extension schema for Swedish public sector software metadata
 * Version: 0.1
 */
export interface XSamhallskodexProfile {
    profileVersion: ProfileVersion;
    architecture: Architecture;
    integration: Integration;
    ai: AI;
    quality?: Quality;
    governance: Governance;
}
export type ProfileVersion = '0.1';
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
export type UIFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs' | 'nuxt' | 'remix' | 'solid' | 'qwik' | 'htmx' | 'blazor' | 'wpf' | 'winforms' | 'swiftui' | 'flutter' | 'react-native' | 'electron' | 'tauri' | 'none' | 'other';
export type BuildTool = 'vite' | 'webpack' | 'esbuild' | 'rollup' | 'parcel' | 'turbopack' | 'rspack' | 'none' | 'other';
export interface ArchitectureUX {
    rating?: Rating;
    accessibility?: Accessibility;
    mobileFriendly?: boolean;
}
export interface Accessibility {
    wcagLevel?: WCAGLevel;
}
export type WCAGLevel = '2.0-A' | '2.0-AA' | '2.0-AAA' | '2.1-A' | '2.1-AA' | '2.1-AAA' | '2.2-A' | '2.2-AA' | '2.2-AAA' | 'unknown';
export interface ArchitectureBackend {
    architecture: BackendArchitecture;
    style?: BackendStyle;
    runtime?: Runtime;
    language?: ProgrammingLanguage;
    database?: Database;
}
export type BackendArchitecture = 'container' | 'vm' | 'serverless' | 'native' | 'mixed';
export type BackendStyle = 'monolith' | 'modular-monolith' | 'microservice' | 'event-driven' | 'serverless' | 'mixed';
export type Runtime = 'node' | 'deno' | 'bun' | 'dotnet' | 'jvm' | 'python' | 'go' | 'rust' | 'php' | 'ruby' | 'other';
export type ProgrammingLanguage = 'typescript' | 'javascript' | 'csharp' | 'fsharp' | 'java' | 'kotlin' | 'scala' | 'python' | 'go' | 'rust' | 'php' | 'ruby' | 'other';
export interface Database {
    primary?: DatabaseType;
}
export type DatabaseType = 'postgresql' | 'mysql' | 'mariadb' | 'sqlserver' | 'oracle' | 'mongodb' | 'dynamodb' | 'cosmosdb' | 'firebase' | 'supabase' | 'sqlite' | 'redis' | 'elasticsearch' | 'none' | 'other';
export interface ArchitectureDeployment {
    container?: ContainerTech;
    orchestration?: Orchestration;
    hosting?: HostingModel;
    iac?: IaCTool[];
}
export type ContainerTech = 'docker' | 'podman' | 'containerd' | 'oci' | 'none';
export type Orchestration = 'kubernetes' | 'docker-compose' | 'docker-swarm' | 'nomad' | 'openshift' | 'ecs' | 'none' | 'other';
export type HostingModel = 'onprem' | 'private-cloud' | 'public-cloud' | 'hybrid';
export type IaCTool = 'terraform' | 'pulumi' | 'ansible' | 'chef' | 'puppet' | 'cloudformation' | 'bicep' | 'cdk' | 'none' | 'other';
export interface Integration {
    apiStyles: APIStyle[];
    protocols?: IntegrationProtocol[];
    identity?: IdentityMethod[];
    events?: EventIntegration;
    openApi?: OpenApiSpec;
}
export type APIStyle = 'rest' | 'graphql' | 'grpc' | 'soap' | 'odata' | 'websocket' | 'none';
export type IntegrationProtocol = 'webhook' | 'mcp' | 'sftp' | 'ftp' | 'amqp' | 'mqtt' | 'kafka' | 'nats' | 'grpc-stream' | 'sse' | 'other';
export type IdentityMethod = 'oidc' | 'oauth2' | 'saml' | 'ldap' | 'ad' | 'bankid' | 'freja' | 'eidas' | 'siths' | 'basic-auth' | 'api-key' | 'jwt' | 'none' | 'other';
export interface EventIntegration {
    enabled?: boolean;
    broker?: EventBroker;
}
export type EventBroker = 'kafka' | 'rabbitmq' | 'redis-pubsub' | 'azure-service-bus' | 'aws-sqs' | 'aws-sns' | 'gcp-pubsub' | 'nats' | 'pulsar' | 'none' | 'other';
export interface OpenApiSpec {
    available?: boolean;
    url?: string;
}
export interface AI {
    enabled: boolean;
    useCases?: AIUseCase[];
    modelExecution?: ModelExecution;
    humanInLoop?: boolean;
    sensitiveDataHandling?: SensitiveDataHandling;
    decisionImpact?: DecisionImpact;
}
export type AIUseCase = 'assistant' | 'chatbot' | 'summarization' | 'classification' | 'extraction' | 'translation' | 'transcription' | 'recommendation' | 'decision-support' | 'anomaly-detection' | 'forecasting' | 'image-recognition' | 'document-processing' | 'code-generation' | 'search' | 'other';
export interface ModelExecution {
    locality?: ModelLocality;
    providers?: AIProvider[];
}
export type ModelLocality = 'local' | 'cloud' | 'hybrid';
export type AIProvider = 'openai' | 'anthropic' | 'azure-openai' | 'google-vertex' | 'aws-bedrock' | 'huggingface' | 'local-llm' | 'mistral' | 'cohere' | 'other';
export type SensitiveDataHandling = 'none' | 'anonymized' | 'restricted' | 'full-access';
export type DecisionImpact = 'none' | 'advisory' | 'semi-automated' | 'automated';
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
/** All controlled values for UI platform select */
export declare const UI_PLATFORMS: UIPlatform[];
/** All controlled values for UI framework select */
export declare const UI_FRAMEWORKS: UIFramework[];
/** All controlled values for backend architecture select */
export declare const BACKEND_ARCHITECTURES: BackendArchitecture[];
/** All controlled values for API styles select */
export declare const API_STYLES: APIStyle[];
/** All controlled values for identity methods select */
export declare const IDENTITY_METHODS: IdentityMethod[];
/** All controlled values for openness level select */
export declare const OPENNESS_LEVELS: OpennessLevel[];
/** All controlled values for data locality select */
export declare const DATA_LOCALITIES: DataLocality[];
/** All controlled values for AI use cases select */
export declare const AI_USE_CASES: AIUseCase[];
export declare const PROFILE_LABELS_SV: Record<string, string>;
//# sourceMappingURL=x-samhallskodex.d.ts.map