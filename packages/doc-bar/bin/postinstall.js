#!/usr/bin/env node

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PKG = '@bottomlessmargaritas/doc-bar';
const DOC_DIR = '.bottomlessmargaritas/application-documentation';

try {
  const projectRoot = process.env.INIT_CWD || process.cwd();
  const publicDir = join(projectRoot, 'public');

  if (!existsSync(publicDir)) {
    // No public directory — might not be a web project, skip silently
    process.exit(0);
  }

  const targetDir = join(publicDir, DOC_DIR);

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    console.log(`${PKG}: Created ${DOC_DIR} in public/`);
    console.log(`${PKG}: Add <AppDocBar /> to your layout to get started`);
  }
} catch {
  // Fail silently — postinstall errors shouldn't break npm install
}
