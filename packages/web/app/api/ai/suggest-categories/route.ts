import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// All valid publiccode.yml categories - synced with @samhallskodex/core
const VALID_CATEGORIES = [
  'accounting', 'agile-project-management', 'applicant-tracking', 'application-development',
  'appointment-scheduling', 'backup', 'billing-and-invoicing', 'blog', 'budgeting',
  'business-intelligence', 'business-process-management', 'cad', 'call-center-management',
  'case-management', 'civic-engagement', 'cloud-management', 'collaboration',
  'communications', 'compliance-management', 'contact-management', 'content-management',
  'crm', 'customer-service-and-support', 'data-analytics', 'data-collection',
  'data-visualization', 'design', 'design-system', 'digital-asset-management',
  'digital-citizenship', 'document-management', 'donor-management', 'e-commerce',
  'e-signature', 'educational-content', 'email-management', 'email-marketing',
  'employee-management', 'enterprise-project-management', 'enterprise-social-networking',
  'erp', 'event-management', 'facility-management', 'feedback-and-reviews-management',
  'financial-reporting', 'fleet-management', 'fundraising', 'gamification',
  'geographic-information-systems', 'government-websites', 'grant-management', 'graphic-design',
  'healthcare', 'help-desk', 'hr', 'ide', 'identity-management', 'instant-messaging',
  'integrated-library-system', 'inventory-management', 'it-asset-management', 'it-development',
  'it-management', 'it-security', 'it-service-management', 'knowledge-management',
  'learning-management-system', 'local-government', 'marketing', 'mind-mapping',
  'mobile-marketing', 'mobile-payment', 'network-management', 'office', 'online-booking',
  'online-community', 'payment-gateway', 'payroll', 'predictive-analysis', 'procurement',
  'productivity-suite', 'project-collaboration', 'project-management', 'property-management',
  'public-participation', 'real-estate-management', 'regulations-and-directives',
  'remote-support', 'reporting-issues', 'resource-management', 'sales-management', 'seo',
  'service-desk', 'social-media-management', 'social-services', 'survey', 'talent-management',
  'task-management', 'taxes-management', 'test-management', 'time-management', 'time-tracking',
  'translation', 'transportation', 'video-conferencing', 'video-editing', 'visitor-management',
  'voip', 'voting', 'warehouse-management', 'waste-management', 'web-collaboration',
  'web-conferencing', 'website-builder', 'website-management', 'whistleblowing', 'workflow-management'
];

// Category aliases - map common AI suggestions to valid categories
const CATEGORY_ALIASES: Record<string, string> = {
  'software-development': 'application-development',
  'software': 'application-development',
  'development': 'application-development',
  'coding': 'application-development',
  'programming': 'application-development',
  'web-development': 'application-development',
  'app-development': 'application-development',
  'customer-support': 'customer-service-and-support',
  'support': 'customer-service-and-support',
  'helpdesk': 'help-desk',
  'devops': 'it-development',
  'ci-cd': 'it-development',
  'automation': 'workflow-management',
  'process-automation': 'workflow-management',
  'government': 'local-government',
  'public-sector': 'local-government',
  'municipality': 'local-government',
  'kommun': 'local-government',
  'security': 'it-security',
  'cybersecurity': 'it-security',
  'authentication': 'identity-management',
  'auth': 'identity-management',
  'login': 'identity-management',
  'sso': 'identity-management',
  'analytics': 'data-analytics',
  'reporting': 'data-analytics',
  'dashboard': 'data-visualization',
  'charts': 'data-visualization',
  'documents': 'document-management',
  'files': 'document-management',
  'file-management': 'document-management',
  'tasks': 'task-management',
  'todo': 'task-management',
  'projects': 'project-management',
};

// DIS Fas 1 priority categories - synced with @samhallskodex/core
const DIS_FASE1_CATEGORIES = [
  'case-management',
  'civic-engagement',
  'data-analytics',
  'digital-citizenship',
  'document-management',
  'identity-management',
  'local-government',
  'public-participation',
  'reporting-issues',
  'workflow-management'
];

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\.git$/, '');
  const urlMatch = cleaned.match(/(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }
  const simpleMatch = cleaned.match(/^([^/]+)\/([^/]+)$/);
  if (simpleMatch) {
    return { owner: simpleMatch[1], repo: simpleMatch[2] };
  }
  return null;
}

async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  // Try different README file names
  const readmeFiles = ['README.md', 'readme.md', 'README', 'readme', 'README.rst', 'readme.rst'];

  for (const filename of readmeFiles) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filename}`,
        { headers: { 'User-Agent': 'publiccode-tools' } }
      );
      if (response.ok) {
        const content = await response.text();
        // Truncate to avoid token limits (first ~8000 chars)
        return content.slice(0, 8000);
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchRepoDescription(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'publiccode-tools',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.description || null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI-tjänsten är inte konfigurerad. Kontakta administratören.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { url, name, description } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'GitHub-URL krävs' },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Ogiltig GitHub-URL' },
        { status: 400 }
      );
    }

    // Fetch README and repo description
    const [readme, repoDescription] = await Promise.all([
      fetchReadme(parsed.owner, parsed.repo),
      fetchRepoDescription(parsed.owner, parsed.repo),
    ]);

    // Build context for Claude
    let context = `Project: ${name || parsed.repo}\n`;
    if (description || repoDescription) {
      context += `Description: ${description || repoDescription}\n`;
    }
    if (readme) {
      context += `\nREADME content:\n${readme}\n`;
    }

    if (!readme && !description && !repoDescription) {
      return NextResponse.json(
        { error: 'Kunde inte hitta README eller beskrivning för detta projekt.' },
        { status: 404 }
      );
    }

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const categoryListForPrompt = VALID_CATEGORIES.map(c => {
      const isDIS = DIS_FASE1_CATEGORIES.includes(c);
      return isDIS ? `${c} (DIS Fas 1 - prioriterat)` : c;
    }).join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analysera följande open source-projekt och föreslå de mest relevanta kategorierna från publiccode.yml-standarden.

${context}

Välj 2-5 kategorier från denna lista som bäst beskriver projektet:
${categoryListForPrompt}

Svara ENDAST med en JSON-array med kategori-ID:n, t.ex.: ["case-management", "document-management", "workflow-management"]

Prioritera kategorier märkta "DIS Fas 1" om de är relevanta, eftersom dessa ger extra synlighet för svenska offentliga organisationer.

JSON-svar:`
        }
      ]
    });

    // Parse response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Kunde inte tolka AI-svaret' },
        { status: 500 }
      );
    }

    const suggestedCategories: string[] = JSON.parse(jsonMatch[0]);

    // Map aliases to valid categories, then filter to only valid ones
    const mappedCategories = suggestedCategories.map(c => {
      // Check if it's an alias that needs mapping
      const mapped = CATEGORY_ALIASES[c.toLowerCase()];
      return mapped || c;
    });

    // Filter to only valid categories and remove duplicates
    const validSuggestions = [...new Set(mappedCategories.filter(c => VALID_CATEGORIES.includes(c)))];

    return NextResponse.json({
      categories: validSuggestions,
      disFase1Count: validSuggestions.filter(c => DIS_FASE1_CATEGORIES.includes(c)).length,
    });

  } catch (error) {
    console.error('AI suggest categories error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid AI-analys' },
      { status: 500 }
    );
  }
}
