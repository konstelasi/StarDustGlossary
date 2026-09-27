#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { loadContent } from './parse';
import { validateContent } from './validate';
import { renderDocsGlossary } from './renderers/docs';
import { writeWebsiteGlossaryFile } from './renderers/website';

/**
 * Compiles content/terms.yaml + content/orientation.yaml into
 * StarDustDocs' and StarDustWebsite's glossary files. Run with `npm run
 * compile` (writes) or `npm run validate` (content checks only, no writes).
 *
 * Usage: node dist/src/compile.js [--docs <path>] [--website <path>]
 *        [--target=docs|website|all] [--validate-only]
 *
 * Path defaults assume the standard sibling layout (StarDustGlossary,
 * StarDustDocs and StarDustWebsite all under the same parent directory).
 */

interface Args {
  docsPath: string;
  websitePath: string;
  target: 'docs' | 'website' | 'all';
  validateOnly: boolean;
}

function parseArgs(argv: string[]): Args {
  const repoRoot = join(__dirname, '..', '..', '..');
  const args: Args = {
    docsPath: join(repoRoot, 'StarDustDocs'),
    websitePath: join(repoRoot, 'StarDustWebsite'),
    target: 'all',
    validateOnly: false,
  };

  for (const arg of argv) {
    if (arg === '--validate-only') {
      args.validateOnly = true;
    } else if (arg.startsWith('--docs=')) {
      args.docsPath = arg.slice('--docs='.length);
    } else if (arg.startsWith('--website=')) {
      args.websitePath = arg.slice('--website='.length);
    } else if (arg.startsWith('--target=')) {
      const value = arg.slice('--target='.length);
      if (value !== 'docs' && value !== 'website' && value !== 'all') {
        throw new Error(`--target must be one of docs|website|all, got "${value}"`);
      }
      args.target = value;
    } else {
      throw new Error(`Unrecognized argument: ${arg}`);
    }
  }

  return args;
}

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
  console.log(`  wrote ${path}`);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const contentDir = join(__dirname, '..', '..', 'content');

  const content = loadContent(contentDir);
  const errors = validateContent(content);
  if (errors.length > 0) {
    console.error(`Content validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(`Validated ${content.terms.length} terms, 0 errors.`);

  if (args.validateOnly) return;

  if (args.target === 'docs' || args.target === 'all') {
    console.log(`Compiling docs -> ${args.docsPath}`);
    writeFile(join(args.docsPath, 'docs', 'reference', 'glossary.md'), renderDocsGlossary(content, 'en'));
    writeFile(join(args.docsPath, 'docs', 'id', 'reference', 'glossary.md'), renderDocsGlossary(content, 'id'));
  }

  if (args.target === 'website' || args.target === 'all') {
    console.log(`Compiling website -> ${args.websitePath}`);
    const enPath = join(args.websitePath, 'messages', 'en', 'glossary.json');
    const idPath = join(args.websitePath, 'messages', 'id', 'glossary.json');
    writeWebsiteGlossaryFile(content, 'en', enPath);
    console.log(`  wrote ${enPath}`);
    writeWebsiteGlossaryFile(content, 'id', idPath);
    console.log(`  wrote ${idPath}`);
  }
}

main();
