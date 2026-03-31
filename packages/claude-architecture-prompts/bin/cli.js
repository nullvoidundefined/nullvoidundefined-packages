#!/usr/bin/env node

import { existsSync, copyFileSync, mkdirSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_DIR = resolve(__dirname, "..", "rules");
const TARGET_DIR = join(".claude", "bottomlessmargaritas");

const isDryRun = process.argv.includes("--dry-run");
const PKG_NAME = "@bottomlessmargaritas/claude-architecture-prompts";

function findProjectRoot(startDir) {
    let dir = startDir;
    while (dir !== dirname(dir)) {
        if (existsSync(join(dir, "package.json"))) {
            return dir;
        }
        dir = dirname(dir);
    }
    return null;
}

function run() {
    const cwd = process.env.INIT_CWD || process.cwd();
    const projectRoot = findProjectRoot(cwd);

    if (!projectRoot) {
        console.error(`${PKG_NAME}: Could not find project root (no package.json found).`);
        process.exit(1);
    }

    const targetDir = join(projectRoot, TARGET_DIR);
    const ruleFiles = readdirSync(RULES_DIR).filter((f) => f.endsWith(".md"));

    if (ruleFiles.length === 0) {
        console.log(`${PKG_NAME}: No rule files found in package.`);
        return;
    }

    if (!existsSync(targetDir)) {
        if (isDryRun) {
            console.log(`[dry-run] Would create directory: ${TARGET_DIR}`);
        } else {
            mkdirSync(targetDir, { recursive: true });
        }
    }

    let copied = 0;
    let skipped = 0;

    for (const file of ruleFiles) {
        const source = join(RULES_DIR, file);
        const target = join(targetDir, file);

        if (existsSync(target)) {
            const sourceContent = readFileSync(source, "utf8");
            const targetContent = readFileSync(target, "utf8");

            if (sourceContent === targetContent) {
                skipped++;
                continue;
            }
        }

        if (isDryRun) {
            console.log(`[dry-run] Would write: ${TARGET_DIR}/${file}`);
        } else {
            copyFileSync(source, target);
        }
        copied++;
    }

    // Remove stale files from previous versions that are no longer in the package.
    // Only remove files matching known prefixes (CLAUDE-*, CLOUD-*) to avoid
    // deleting user-created files in the same directory.
    const KNOWN_FILE_PREFIXES = ["CLAUDE-", "CLAUDE.", "CLOUD-"];
    const currentFiles = new Set(ruleFiles);
    let removed = 0;

    if (existsSync(targetDir)) {
        for (const file of readdirSync(targetDir)) {
            if (
                file.endsWith(".md") &&
                !currentFiles.has(file) &&
                KNOWN_FILE_PREFIXES.some((prefix) => file.startsWith(prefix))
            ) {
                if (isDryRun) {
                    console.log(`[dry-run] Would remove stale file: ${TARGET_DIR}/${file}`);
                } else {
                    unlinkSync(join(targetDir, file));
                }
                removed++;
            }
        }
    }

    console.log(
        `${PKG_NAME}: ${copied} written, ${skipped} unchanged, ${removed} stale removed → ${TARGET_DIR}/`,
    );
}

run();
