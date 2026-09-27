import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { GlossaryContent, Locale, OrientationContent, TermEntry } from './schema';

/**
 * Loads content/terms.yaml and content/orientation.yaml from a content
 * directory. No validation here — validate.ts owns content invariants, this
 * just deserializes.
 */
export function loadContent(contentDir: string): GlossaryContent {
  const terms = parseYaml(readFileSync(join(contentDir, 'terms.yaml'), 'utf8')) as TermEntry[];
  const orientation = parseYaml(readFileSync(join(contentDir, 'orientation.yaml'), 'utf8')) as OrientationContent;
  return { terms, orientation };
}

const MARKER_PATTERN = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Resolves every `[[slug]]` / `[[slug|display text]]` cross-reference marker
 * in `text` against the term catalog. `render` decides the per-target output
 * for a single resolved reference — a markdown link for docs, or plain text
 * for the website, which has no linking in its glossary prose today.
 */
function resolveMarkers(
  text: string,
  termsBySlug: Map<string, TermEntry>,
  render: (slug: string, displayText: string) => string,
): string {
  return text.replace(MARKER_PATTERN, (match, slug: string, override: string | undefined) => {
    const target = termsBySlug.get(slug);
    if (!target) {
      throw new Error(`Unresolved glossary cross-reference: [[${slug}]] has no matching term`);
    }
    const displayText = override ?? target.term;
    return render(slug, displayText);
  });
}

/** Renders body/orientation text for a StarDustDocs markdown page: markers become real anchor links, emphasis stays as-is. */
export function renderDocsText(text: string, termsBySlug: Map<string, TermEntry>): string {
  return resolveMarkers(text, termsBySlug, (slug, displayText) => `[${displayText}](#${slug})`);
}

/** Renders body/orientation text for the website's plain-text JSON catalog: markers and emphasis are both stripped to plain text. */
export function renderWebsiteText(text: string, termsBySlug: Map<string, TermEntry>): string {
  const withoutMarkers = resolveMarkers(text, termsBySlug, (_slug, displayText) => displayText);
  return withoutMarkers.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

export function indexBySlug(terms: TermEntry[]): Map<string, TermEntry> {
  return new Map(terms.map(term => [term.slug, term]));
}

export function sortedTerms(terms: TermEntry[]): TermEntry[] {
  return [...terms].sort((a, b) => a.term.localeCompare(b.term, 'en'));
}

export const LOCALES: Locale[] = ['en', 'id'];
