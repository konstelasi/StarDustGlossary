export type Locale = 'en' | 'id';

export interface LocalizedText {
  en: string;
  id: string;
}

export interface TermEntry {
  slug: string;
  term: string;
  seeAlso: string[];
  short: LocalizedText;
  body: LocalizedText;
}

export interface OrientationContent {
  en: string[];
  id: string[];
}

export interface GlossaryContent {
  terms: TermEntry[];
  orientation: OrientationContent;
}
