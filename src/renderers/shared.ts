import type { GlossaryContent, Locale } from '../schema';
import { indexBySlug, renderWebsiteText } from '../parse';

/**
 * Builds the flat `{ [slug]: { term, short } }` catalog shared by every
 * consumer that renders a one-sentence popup definition at runtime — the
 * website's glossary.json `terms` key and StarDustDocs' Term.vue data file.
 * Both want plain text (no [[markers]], no markdown emphasis), which is
 * exactly what renderWebsiteText already produces.
 */
export function buildTermsCatalog(content: GlossaryContent, locale: Locale): Record<string, { term: string; short: string }> {
  const termsBySlug = indexBySlug(content.terms);
  const terms: Record<string, { term: string; short: string }> = {};
  for (const term of [...content.terms].sort((a, b) => a.slug.localeCompare(b.slug))) {
    terms[term.slug] = {
      term: term.term,
      short: renderWebsiteText(term.short[locale], termsBySlug),
    };
  }
  return terms;
}
