#!/usr/bin/env node
/**
 * @intrust/canon postinstall hook.
 *
 * Copies the canon docs (memory/*.md) into the consumer project's
 * `docs/canon/` directory so devs and Claude Code can read them right
 * out of the project tree without dealing with `node_modules` paths.
 *
 * The destination is `.gitignored` by convention — it's always derived
 * from the installed @intrust/canon version. Edit the canon repo, push,
 * `npm install` in the consumer, and `docs/canon/` refreshes.
 *
 * Skips silently when:
 *   - Run inside the canon repo itself (no destination project to sync to)
 *   - INTRUST_CANON_SKIP_SYNC=1 is set in the env (CI / local debug)
 */

import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CANON_ROOT = resolve(__dirname, "..");
const CANON_MEMORY = join(CANON_ROOT, "memory");

// `npm install` runs postinstall scripts with the consumer project as cwd
// (or INIT_CWD set to the consumer for nested calls). For the canon's own
// install, cwd === CANON_ROOT, which we skip.
const consumerRoot = process.env.INIT_CWD || process.cwd();
if (resolve(consumerRoot) === CANON_ROOT) {
  process.exit(0);
}
if (process.env.INTRUST_CANON_SKIP_SYNC === "1") {
  process.exit(0);
}

const dest = join(consumerRoot, "docs", "canon");
mkdirSync(dest, { recursive: true });

const files = readdirSync(CANON_MEMORY).filter((f) => f.endsWith(".md"));
let copied = 0;
for (const f of files) {
  const src = join(CANON_MEMORY, f);
  if (!statSync(src).isFile()) continue;
  copyFileSync(src, join(dest, f));
  copied += 1;
}

// Drop a one-line index for quick scanning in the consumer.
const lines = [
  "# Canon (synced from @intrust/canon)",
  "",
  "Universal UI/UX canon — the rules every Intrust app follows. Edit upstream",
  "in [IntrustIT/intrust-canon](https://github.com/IntrustIT/intrust-canon),",
  "not here. This directory is regenerated on every `npm install`.",
  "",
  "## Files",
  "",
  ...files.sort().map((f) => `- [${f}](./${f})`),
];
writeFileSync(join(dest, "README.md"), lines.join("\n") + "\n");

console.log(`@intrust/canon: synced ${copied} canon doc(s) to ${dest}`);
