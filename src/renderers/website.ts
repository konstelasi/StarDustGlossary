import { readFileSync, writeFileSync } from 'node:fs';
import type { GlossaryContent, Locale } from '../schema';
import { indexBySlug, renderWebsiteText } from '../parse';

interface WebsiteGlossaryCatalog {
  meta: unknown;
  hero: unknown;
  orientationHeading: unknown;
  orientation: string[];
  termsHeading: unknown;
  popup: unknown;
  terms: Record<string, { term: string; short: string }>;
}

/**
 * Rewrites only the `terms` and `orientation` keys of an existing
 * messages/{locale}/glossary.json, leaving `meta`, `hero`,
 * `orientationHeading`, `termsHeading` and `popup` exactly as the website
 * repo owns them — those are site-specific presentation chrome, not
 * glossary knowledge.
 */
export function renderWebsiteGlossaryFile(content: GlossaryContent, locale: Locale, existingFilePath: string): string {
  const existing = JSON.parse(readFileSync(existingFilePath, 'utf8')) as WebsiteGlossaryCatalog;
  const termsBySlug = indexBySlug(content.terms);

  existing.orientation = content.orientation[locale].map(paragraph => renderWebsiteText(paragraph, termsBySlug));

  const terms: Record<string, { term: string; short: string }> = {};
  for (const term of [...content.terms].sort((a, b) => a.slug.localeCompare(b.slug))) {
    terms[term.slug] = {
      term: term.term,
      short: renderWebsiteText(term.short[locale], termsBySlug),
    };
  }
  existing.terms = terms;

  return `${JSON.stringify(existing, null, 2)}\n`;
}

export function writeWebsiteGlossaryFile(content: GlossaryContent, locale: Locale, filePath: string): void {
  writeFileSync(filePath, renderWebsiteGlossaryFile(content, locale, filePath), 'utf8');
}
