// Copies the stylesheets in src/ to the same places in dist/ (tsc only emits code).
import { cpSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

for (const file of walk('src').filter((f) => f.endsWith('.css'))) {
  cpSync(file, join('dist', relative('src', file)));
}
