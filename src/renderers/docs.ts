import type { GlossaryContent, Locale, TermEntry } from '../schema';
import { indexBySlug, renderDocsText, sortedTerms } from '../parse';

/**
 * StarDustDocs page chrome — headings, intro copy, labels. This is VitePress
 * presentation, not glossary knowledge, so it lives here rather than in
 * canonical content (mirrors the website renderer keeping its own hero/meta
 * copy untouched).
 */
const CHROME: Record<
  Locale,
  {
    h1: string;
    introParagraphs: string[];
    howHeading: string;
    architectureLine: string;
    termsHeading: string;
    seeAlsoLabel: string;
  }
> = {
  en: {
    h1: 'Glossary',
    introParagraphs: [
      'Plain-language definitions of every StarDust term you will meet while using the library. ' +
        'If you are new here, read [How the pieces fit](#how-the-pieces-fit) first. It threads the ' +
        'core terms together in one pass. The [Terms](#terms) section below it is alphabetical, for ' +
        'looking things up later.',
    ],
    howHeading: 'How the pieces fit',
    architectureLine: 'For the same story with diagrams, see [Architecture at a glance](/concepts/architecture).',
    termsHeading: 'Terms',
    seeAlsoLabel: '**See also:**',
  },
  id: {
    h1: 'Glosarium',
    introParagraphs: [
      'Definisi sederhana untuk setiap istilah StarDust yang akan Anda temui saat memakai library ini. ' +
        'Kalau Anda baru di sini, baca dulu [Bagaimana semuanya saling terhubung](#bagaimana-semuanya-saling-terhubung), ' +
        'yang merangkai istilah-istilah inti dalam satu alur. Bagian [Istilah](#istilah) di bawahnya berurutan ' +
        'menurut abjad, untuk dicari kemudian.',
      'Istilah teknis di halaman ini sengaja dibiarkan dalam bahasa Inggris, sama seperti di seluruh dokumentasi. ' +
        'Yang diterjemahkan hanya penjelasannya.',
    ],
    howHeading: 'Bagaimana semuanya saling terhubung',
    architectureLine: 'Untuk cerita yang sama lengkap dengan diagram, lihat [Sekilas arsitektur](/id/concepts/architecture).',
    termsHeading: 'Istilah',
    seeAlsoLabel: '**Lihat juga:**',
  },
};

function renderTermSection(term: TermEntry, locale: Locale, termsBySlug: Map<string, TermEntry>): string {
  const heading = `### ${term.term}`;
  const body = renderDocsText(term.body[locale], termsBySlug);

  if (term.seeAlso.length === 0) {
    return `${heading}\n\n${body}`;
  }

  const seeAlsoLinks = term.seeAlso
    .map(slug => {
      const target = termsBySlug.get(slug);
      if (!target) throw new Error(`Term "${term.slug}": seeAlso references unknown slug "${slug}"`);
      return `[${target.term}](#${slug})`;
    })
    .join(', ');

  return `${heading}\n\n${body}\n\n${CHROME[locale].seeAlsoLabel} ${seeAlsoLinks}.`;
}

export function renderDocsGlossary(content: GlossaryContent, locale: Locale): string {
  const chrome = CHROME[locale];
  const termsBySlug = indexBySlug(content.terms);
  const orientation = content.orientation[locale].map(paragraph => renderDocsText(paragraph, termsBySlug));
  const terms = sortedTerms(content.terms).map(term => renderTermSection(term, locale, termsBySlug));

  const sections = [
    `# ${chrome.h1}`,
    ...chrome.introParagraphs,
    `## ${chrome.howHeading}`,
    ...orientation,
    chrome.architectureLine,
    `## ${chrome.termsHeading}`,
    ...terms,
  ];

  return `${sections.join('\n\n')}\n`;
}
