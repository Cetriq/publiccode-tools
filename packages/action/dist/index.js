/**
 * @dis-tools/action
 * GitHub Action for publiccode.yml validation and scoring
 */
import * as core from '@actions/core';
import * as github from '@actions/github';
import { readFileSync, existsSync } from 'fs';
import { load as parseYaml } from 'js-yaml';
import { validate, scoreYaml, CATEGORIES, } from '@godwana/publiccode-core';
async function run() {
    try {
        // Get inputs
        const path = core.getInput('path') || './publiccode.yml';
        const failOnWarnings = core.getInput('fail-on-warnings') === 'true';
        const minScore = parseInt(core.getInput('min-score') || '0', 10);
        const annotate = core.getInput('annotate') !== 'false';
        const lang = (core.getInput('lang') || 'sv');
        const shouldRegister = core.getInput('register') === 'true';
        const registryApiKey = core.getInput('registry-api-key');
        const registryUrl = core.getInput('registry-url') || 'https://publiccode.dis.tools/api/registry';
        core.info(lang === 'sv' ? `Validerar ${path}...` : `Validating ${path}...`);
        // Check if file exists
        if (!existsSync(path)) {
            core.setFailed(lang === 'sv'
                ? `Filen '${path}' hittades inte`
                : `File '${path}' not found`);
            return;
        }
        // Read and validate
        const yaml = readFileSync(path, 'utf-8');
        const validationResult = validate(yaml, { lang });
        const scoreResult = scoreYaml(yaml, { lang });
        // Set outputs
        core.setOutput('valid', validationResult.valid);
        core.setOutput('score', scoreResult.total);
        core.setOutput('errors', validationResult.errors.length);
        core.setOutput('warnings', validationResult.warnings.length);
        // Create annotations
        if (annotate) {
            createAnnotations(validationResult, path, lang);
        }
        // Log results
        logResults(validationResult, scoreResult, lang);
        // Create job summary
        await createSummary(validationResult, scoreResult, path, lang);
        // Determine if action should fail
        let shouldFail = false;
        let failReason = '';
        if (!validationResult.valid) {
            shouldFail = true;
            failReason =
                lang === 'sv'
                    ? `Validering misslyckades med ${validationResult.errors.length} fel`
                    : `Validation failed with ${validationResult.errors.length} errors`;
        }
        else if (failOnWarnings && validationResult.warnings.length > 0) {
            shouldFail = true;
            failReason =
                lang === 'sv'
                    ? `${validationResult.warnings.length} varningar hittades (--fail-on-warnings)`
                    : `${validationResult.warnings.length} warnings found (--fail-on-warnings)`;
        }
        else if (minScore > 0 && scoreResult.total < minScore) {
            shouldFail = true;
            failReason =
                lang === 'sv'
                    ? `DIS-Readiness Score ${scoreResult.total} är under minimum ${minScore}`
                    : `DIS-Readiness Score ${scoreResult.total} is below minimum ${minScore}`;
        }
        if (shouldFail) {
            core.setFailed(failReason);
        }
        else {
            core.info(lang === 'sv'
                ? `✓ Validering lyckades! DIS-Readiness Score: ${scoreResult.total}/100`
                : `✓ Validation passed! DIS-Readiness Score: ${scoreResult.total}/100`);
            // Register in catalog if requested and score >= 60
            if (shouldRegister && scoreResult.total >= 60) {
                if (!registryApiKey) {
                    core.warning(lang === 'sv'
                        ? 'Registrering kräver registry-api-key'
                        : 'Registration requires registry-api-key');
                    core.setOutput('registered', false);
                }
                else {
                    const registered = await registerRepository(yaml, scoreResult, registryApiKey, registryUrl, lang);
                    core.setOutput('registered', registered);
                }
            }
            else if (shouldRegister && scoreResult.total < 60) {
                core.info(lang === 'sv'
                    ? `Registrering hoppad - score ${scoreResult.total} är under 60`
                    : `Registration skipped - score ${scoreResult.total} is below 60`);
                core.setOutput('registered', false);
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed('An unexpected error occurred');
        }
    }
}
/**
 * Create GitHub annotations for errors and warnings
 */
function createAnnotations(result, filePath, lang) {
    // Errors as error annotations
    for (const error of result.errors) {
        core.error(error.message, {
            title: lang === 'sv' ? 'Valideringsfel' : 'Validation Error',
            file: filePath,
        });
    }
    // Warnings as warning annotations
    for (const warning of result.warnings) {
        const message = warning.suggestion
            ? `${warning.message}\n→ ${warning.suggestion}`
            : warning.message;
        core.warning(message, {
            title: lang === 'sv' ? 'Varning' : 'Warning',
            file: filePath,
        });
    }
}
/**
 * Log results to console
 */
function logResults(validationResult, scoreResult, lang) {
    core.info('');
    if (validationResult.errors.length > 0) {
        core.info(lang === 'sv'
            ? `❌ Fel (${validationResult.errors.length}):`
            : `❌ Errors (${validationResult.errors.length}):`);
        for (const error of validationResult.errors) {
            core.info(`   • ${error.path}: ${error.message}`);
        }
    }
    if (validationResult.warnings.length > 0) {
        core.info(lang === 'sv'
            ? `⚠️ Varningar (${validationResult.warnings.length}):`
            : `⚠️ Warnings (${validationResult.warnings.length}):`);
        for (const warning of validationResult.warnings) {
            core.info(`   • ${warning.path}: ${warning.message}`);
        }
    }
    core.info('');
    core.info(`📊 DIS-Readiness Score: ${scoreResult.total}/100`);
    if (scoreResult.suggestions.length > 0) {
        core.info(lang === 'sv' ? `💡 Förbättringsförslag:` : `💡 Suggestions:`);
        for (const suggestion of scoreResult.suggestions.slice(0, 3)) {
            core.info(`   • ${suggestion.message} (+${suggestion.potentialPoints}p)`);
        }
    }
}
/**
 * Create GitHub Actions job summary
 */
async function createSummary(validationResult, scoreResult, filePath, lang) {
    const isValid = validationResult.valid;
    const statusIcon = isValid ? '✅' : '❌';
    const statusText = isValid
        ? lang === 'sv'
            ? 'Godkänd'
            : 'Passed'
        : lang === 'sv'
            ? 'Misslyckad'
            : 'Failed';
    // Score color
    let scoreColor = '🔴';
    if (scoreResult.total >= 80)
        scoreColor = '🟢';
    else if (scoreResult.total >= 60)
        scoreColor = '🟡';
    else if (scoreResult.total >= 40)
        scoreColor = '🟠';
    // Build summary
    await core.summary
        .addHeading(`${statusIcon} publiccode.yml Validering`, 2)
        .addTable([
        [
            { data: lang === 'sv' ? 'Status' : 'Status', header: true },
            { data: lang === 'sv' ? 'Fil' : 'File', header: true },
            { data: 'DIS-Readiness Score', header: true },
        ],
        [statusText, filePath, `${scoreColor} ${scoreResult.total}/100`],
    ])
        .addRaw('')
        .write();
    // Errors section
    if (validationResult.errors.length > 0) {
        const errorRows = validationResult.errors.map((e) => [e.path, e.message]);
        await core.summary
            .addHeading(lang === 'sv' ? '❌ Fel' : '❌ Errors', 3)
            .addTable([
            [
                { data: lang === 'sv' ? 'Fält' : 'Field', header: true },
                { data: lang === 'sv' ? 'Meddelande' : 'Message', header: true },
            ],
            ...errorRows,
        ])
            .write();
    }
    // Warnings section
    if (validationResult.warnings.length > 0) {
        const warningRows = validationResult.warnings.map((w) => [
            w.path,
            w.message,
        ]);
        await core.summary
            .addHeading(lang === 'sv' ? '⚠️ Varningar' : '⚠️ Warnings', 3)
            .addTable([
            [
                { data: lang === 'sv' ? 'Fält' : 'Field', header: true },
                { data: lang === 'sv' ? 'Meddelande' : 'Message', header: true },
            ],
            ...warningRows,
        ])
            .write();
    }
    // Score breakdown
    await core.summary
        .addHeading(lang === 'sv' ? '📊 Poänguppdelning' : '📊 Score Breakdown', 3)
        .addTable([
        [
            { data: lang === 'sv' ? 'Kategori' : 'Category', header: true },
            { data: lang === 'sv' ? 'Poäng' : 'Score', header: true },
        ],
        [
            lang === 'sv' ? 'Obligatoriska fält' : 'Required Fields',
            `${scoreResult.breakdown.requiredFields.score}/${scoreResult.breakdown.requiredFields.maxScore}`,
        ],
        [
            lang === 'sv' ? 'Dokumentation' : 'Documentation',
            `${scoreResult.breakdown.documentation.score}/${scoreResult.breakdown.documentation.maxScore}`,
        ],
        [
            lang === 'sv' ? 'Lokalisering' : 'Localisation',
            `${scoreResult.breakdown.localisation.score}/${scoreResult.breakdown.localisation.maxScore}`,
        ],
        [
            lang === 'sv' ? 'Underhåll' : 'Maintenance',
            `${scoreResult.breakdown.maintenance.score}/${scoreResult.breakdown.maintenance.maxScore}`,
        ],
        [
            'DIS-specifikt',
            `${scoreResult.breakdown.disSpecific.score}/${scoreResult.breakdown.disSpecific.maxScore}`,
        ],
    ])
        .write();
    // Suggestions
    if (scoreResult.suggestions.length > 0) {
        const suggestionList = scoreResult.suggestions
            .slice(0, 5)
            .map((s) => `${s.message} (+${s.potentialPoints}p)`)
            .join('\n');
        await core.summary
            .addHeading(lang === 'sv' ? '💡 Förbättringsförslag' : '💡 Suggestions', 3)
            .addRaw(suggestionList)
            .write();
    }
}
/**
 * Register repository in the DIS catalog
 */
async function registerRepository(yaml, scoreResult, apiKey, registryUrl, lang) {
    try {
        core.info(lang === 'sv'
            ? '📤 Registrerar i DIS-katalogen...'
            : '📤 Registering in DIS catalog...');
        // Parse YAML to extract data
        const data = parseYaml(yaml);
        // Get repo URL from GitHub context
        const repoUrl = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}`;
        // Get categories from publiccode.yml
        const rawCategories = data.categories || [];
        const validCategories = rawCategories.filter(cat => CATEGORIES.some(c => c.id === cat));
        // Check if any category is DIS Fase 1
        const disFase1 = validCategories.some(cat => CATEGORIES.find(c => c.id === cat)?.disFase1 === true);
        // Build payload
        const payload = {
            url: data.url || repoUrl,
            name: data.name || github.context.repo.repo,
            description: (data.description?.sv ||
                data.description?.en ||
                Object.values(data.description || {})[0] ||
                '').slice(0, 300),
            score: scoreResult.total,
            categories: validCategories,
            disFase1,
            owner: github.context.repo.owner,
            license: data.legal?.license || '',
            developmentStatus: data.developmentStatus || 'development',
            maintenanceType: data.maintenance?.type || 'internal',
        };
        // POST to registry
        const response = await fetch(registryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });
        const result = (await response.json());
        if (response.ok && result.success) {
            core.info(lang === 'sv'
                ? `✓ ${result.updated ? 'Uppdaterad' : 'Registrerad'} i DIS-katalogen`
                : `✓ ${result.updated ? 'Updated' : 'Registered'} in DIS catalog`);
            return true;
        }
        else {
            core.warning(lang === 'sv'
                ? `Registrering misslyckades: ${result.message}`
                : `Registration failed: ${result.message}`);
            return false;
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        core.warning(lang === 'sv'
            ? `Registrering misslyckades: ${message}`
            : `Registration failed: ${message}`);
        return false;
    }
}
run();
//# sourceMappingURL=index.js.map