/**
 * x-samhallskodex Profile TypeScript types
 * Extension schema for Swedish public sector software metadata
 * Version: 0.1
 */
// ============================================================================
// Utility Types for UI
// ============================================================================
/** All controlled values for UI platform select */
export const UI_PLATFORMS = ['web', 'desktop', 'mobile', 'cli', 'api-only', 'embedded'];
/** All controlled values for UI framework select */
export const UI_FRAMEWORKS = [
    'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'remix', 'solid', 'qwik', 'htmx',
    'blazor', 'wpf', 'winforms', 'swiftui', 'flutter', 'react-native', 'electron', 'tauri',
    'none', 'other'
];
/** All controlled values for backend architecture select */
export const BACKEND_ARCHITECTURES = ['container', 'vm', 'serverless', 'native', 'mixed'];
/** All controlled values for API styles select */
export const API_STYLES = ['rest', 'graphql', 'grpc', 'soap', 'odata', 'websocket', 'none'];
/** All controlled values for identity methods select */
export const IDENTITY_METHODS = [
    'oidc', 'oauth2', 'saml', 'ldap', 'ad', 'bankid', 'freja', 'eidas', 'siths',
    'basic-auth', 'api-key', 'jwt', 'none', 'other'
];
/** All controlled values for openness level select */
export const OPENNESS_LEVELS = ['open-source', 'open-core', 'source-available', 'proprietary'];
/** All controlled values for data locality select */
export const DATA_LOCALITIES = ['municipality', 'sweden', 'eu', 'non-eu', 'hybrid', 'unknown'];
/** All controlled values for AI use cases select */
export const AI_USE_CASES = [
    'assistant', 'chatbot', 'summarization', 'classification', 'extraction',
    'translation', 'transcription', 'recommendation', 'decision-support',
    'anomaly-detection', 'forecasting', 'image-recognition', 'document-processing',
    'code-generation', 'search', 'other'
];
// ============================================================================
// Swedish Labels for UI
// ============================================================================
export const PROFILE_LABELS_SV = {
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
//# sourceMappingURL=x-samhallskodex.js.map