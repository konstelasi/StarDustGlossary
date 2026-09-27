import type { GlossaryContent, Locale } from './schema';
import { LOCALES } from './parse';

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** A definition is meant to be one sentence — no internal sentence break before the final punctuation mark. Ported from StarDustWebsite/scripts/verify-glossary.ts's `isOneSentence`. */
function isOneSentence(text: string): boolean {
  const trimmed = text.trim();
  if (!/[.!?]$/.test(trimmed)) return false;
  const body = trimmed.slice(0, -1);
  return !/[.!?]\s/.test(body);
}

export function validateContent(content: GlossaryContent): string[] {
  const errors: string[] = [];
  const seenSlugs = new Set<string>();

  for (const term of content.terms) {
    if (!KEBAB_CASE.test(term.slug)) {
      errors.push(`Term "${term.term}": slug "${term.slug}" is not kebab-case`);
    }
    if (seenSlugs.has(term.slug)) {
      errors.push(`Duplicate slug: "${term.slug}"`);
    }
    seenSlugs.add(term.slug);

    if (!term.term.trim()) {
      errors.push(`Term with slug "${term.slug}" has an empty display name`);
    }

    for (const locale of LOCALES) {
      if (!term.body[locale]?.trim()) {
        errors.push(`Term "${term.slug}": body.${locale} is empty`);
      }
      const short = term.short[locale];
      if (!short?.trim()) {
        errors.push(`Term "${term.slug}": short.${locale} is empty`);
      } else if (!isOneSentence(short)) {
        errors.push(`Term "${term.slug}": short.${locale} must be exactly one sentence — got "${short}"`);
      }
    }
  }

  for (const term of content.terms) {
    for (const seeAlsoSlug of term.seeAlso) {
      if (!seenSlugs.has(seeAlsoSlug)) {
        errors.push(`Term "${term.slug}": seeAlso references unknown slug "${seeAlsoSlug}"`);
      }
    }
  }

  const orientationLengths: Partial<Record<Locale, number>> = {};
  for (const locale of LOCALES) {
    const paragraphs = content.orientation[locale];
    if (!paragraphs || paragraphs.length === 0) {
      errors.push(`orientation.${locale} has no paragraphs`);
    }
    orientationLengths[locale] = paragraphs?.length ?? 0;
  }
  if (orientationLengths.en !== orientationLengths.id) {
    errors.push(
      `orientation paragraph count differs between locales: en=${orientationLengths.en}, id=${orientationLengths.id}`,
    );
  }

  return errors;
}
