import type { GlossaryContent, Locale } from '../schema';
import { buildTermsCatalog } from './shared';

/** Renders the per-locale JSON data file StarDustDocs' Term.vue popover component imports at build time. */
export function renderDocsGlossaryData(content: GlossaryContent, locale: Locale): string {
  return `${JSON.stringify(buildTermsCatalog(content, locale), null, 2)}\n`;
}
