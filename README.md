# StarDustGlossary

The canonical source of the StarDust glossary — the 44 terms and the "How the pieces fit" narrative that StarDustDocs and StarDustWebsite both show. This repo holds the content plus a small compiler; the two sites never hand-author glossary knowledge themselves, only the presentation around it.

## Why this exists

Before this repo, the glossary lived in two independently hand-maintained places — StarDustDocs' `docs/reference/glossary.md` (full prose, EN + ID) and StarDustWebsite's `messages/{en,id}/glossary.json` (one-sentence popover text + a condensed narrative) — and they drifted. This repo is the single place that content is written; each site's own build regenerates its copy from it.

Each site keeps its own presentation chrome independently configured — hero copy, page titles, UI labels — since only the glossary *knowledge* should stop drifting, not each site's tone. See each renderer's source (`src/renderers/docs.ts`, `src/renderers/website.ts`) for exactly which keys are generated vs. site-owned.

## Content schema

`content/terms.yaml` — one entry per term:

```yaml
- slug: backfill-window        # kebab-case, stable — this is the anchor/id used by both sites
  term: Backfill window        # display name; stays English on the Indonesian pages too
  seeAlso: [backfill, reconciler]
  short:
    en: One-sentence popover definition.
    id: Definisi satu kalimat untuk popover.
  body:
    en: |
      Full multi-paragraph prose. Reference another term with [[slug]] or
      [[slug|custom display text]] — each renderer resolves it differently
      (a real anchor link for docs, plain text for the website).
    id: |
      Prosa lengkap, boleh multi-paragraf, sama aturannya.
```

`content/orientation.yaml` — the "How the pieces fit" narrative, `en`/`id` arrays of paragraphs using the same `**bold**` / `[[slug]]` conventions.

Both `body` and `orientation` support `**bold**` / `*italic*` emphasis and `[[slug]]` / `[[slug|text]]` cross-references. `short` does not — it's meant to render as plain text everywhere, including the hover popovers on both sites.

## Compiling

```bash
npm install
npm run compile
```

With no arguments, `npm run compile` writes into `../StarDustDocs` and `../StarDustWebsite` — the standard sibling layout (clone this repo next to both, the same way `SDDPG` sits alongside the main StarDust repo). Override with `--docs=<path>` / `--website=<path>` / `--target=docs|website|all`.

`npm run validate` runs the content checks (unique kebab-case slugs, `seeAlso` targets exist, every `short` is exactly one sentence, matching orientation paragraph counts between locales) without writing anything — safe to run with no sibling checkouts present.

## What each renderer touches

- **Docs** (`src/renderers/docs.ts`): fully rewrites `docs/reference/glossary.md` and `docs/id/reference/glossary.md`. Page chrome (headings, intro copy, the "See also:" label) lives in the renderer itself, not in canonical content.
- **Docs popover data** (`src/renderers/docs-data.ts`): writes `docs/.vitepress/theme/glossary-data/{en,id}.json`, the per-term catalog (`term`, `short`, `body`, `seeAlso`) that StarDustDocs' `Term.vue` hover popover imports at build time. Pages opt in per term with `<Term id="slug">text</Term>`.
- **Website** (`src/renderers/website.ts`): reads the existing `messages/{en,id}/glossary.json` and replaces only the `terms` and `orientation` keys — `meta`, `hero`, `orientationHeading`, `termsHeading`, and `popup` are left exactly as the website repo owns them.

Generated output is committed in each consuming repo like any other source file — there is no CI dependency on this repo in either consumer; regenerating is a manual step whenever glossary content changes here.
