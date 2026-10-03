# CLAUDE.md

Guidance for AI coding agents in this repository. The content schema, the compiler and what each renderer touches are in [README.md](README.md).

## This repository

- All glossary knowledge lives in `content/terms.yaml` and `content/orientation.yaml`, in English and Indonesian side by side. StarDustDocs and StarDustWebsite only render it, so never fix a term in their generated files.
- **A term's `short` text must stand alone**, because it is the hover popover on both sites. Write it as one complete sentence that makes sense with nothing around it.
- **The `term` display name stays English** on Indonesian pages too.
- The glossary is consumer-facing. **Never cite an ADR or name a numbered build phase**, and name only the classes, methods and settings a StarDust user actually touches.
- After changing content, rerun the compiler and regenerate both sites' output (README, "Compiling").

## Writing style

Every human-read text here follows StarDust's writing style guide (`.agent/rules/writing-style-guide.md` in <https://github.com/damarbob/StarDust>). The core of it:

- Never use an em dash or an en dash, nor a hyphen standing in for one. Split the sentence, or use a comma or parentheses. Hyphenated words such as "end-to-end" are fine.
- Never put a colon or semicolon in a heading or title.
- Use colons and semicolons sparingly in prose. Prefer two sentences.
- One strong claim with a concrete fact beside it is fine. Two in one line, or one in every sentence, reads as generated.
- Aim for about 80% formal and 20% conversational, nearer fully formal for definitions. Vary sentence length, and never introduce errors on purpose.

Older entries still have dashes. Follow the rule for every sentence you write or rewrite.

## Indonesian copy

- **StarDust terms stay English**: Field, Entry, Tenant, Page, Slot, Engine, Wire format and the rest of the glossary. If a translation sounds odd in Indonesian, keep the English. `bidang`, `penyewa`, `halaman`, `mesin` and `kawat` were all tried and reverted.
- **Re-compose, don't translate word by word.** Literal idioms and prepositions read as calque, for example `kolom kelas satu` for "first-class columns" or `di bawah` for "under this clause".
- **Check meaning against the English, not just fluency.** Words with a narrow technical sense are where a fluent translation goes wrong. A "free" slot is available, not `gratis`. A "tombstoned" column is marked, not `dihapus`. A double negative must survive translation.
- If swapping one word doesn't fix an awkward sentence, rewrite the whole sentence.

## Commits

- Don't commit unless asked. Hand over the message and a `git add` with explicit paths.
- **Never add a `Co-Authored-By` line** or any other attribution trailer. A person adds one by hand if they want it.
- Follow StarDust's `.agent/rules/commit-style-guide.md`: an imperative subject with no prefix, bullets for several changes, body lines never hard-wrapped, and never `#` followed by digits.
