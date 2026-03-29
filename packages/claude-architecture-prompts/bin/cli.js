#!/usr/bin/env node

import { existsSync, copyFileSync, mkdirSync, readFileSync, readdirSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_DIR = resolve(__dirname, "..", "rules");
const TARGET_DIR_NAME = ".claude";

const isAuto = process.argv.includes("--auto");
const isDryRun = process.argv.includes("--dry-run");

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

function getBackupName(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `${filePath}.backup-${timestamp}`;
}

async function prompt(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

async function run() {
    // When running as postinstall inside node_modules, walk up to the consuming project root
    const cwd = process.env.INIT_CWD || process.cwd();
    const projectRoot = findProjectRoot(cwd);

    if (!projectRoot) {
        console.error("@null_void_undefined/claude-architecture-prompts: Could not find project root (no package.json found).");
        process.exit(1);
    }

    const targetDir = join(projectRoot, TARGET_DIR_NAME);
    const ruleFiles = readdirSync(RULES_DIR).filter((f) => f.endsWith(".md"));

    if (ruleFiles.length === 0) {
        console.log("@null_void_undefined/claude-architecture-prompts: No rule files found in package.");
        return;
    }

    if (!existsSync(targetDir)) {
        if (isDryRun) {
            console.log(`[dry-run] Would create directory: ${targetDir}`);
        } else {
            mkdirSync(targetDir, { recursive: true });
        }
    }

    let copied = 0;
    let backed = 0;
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

            if (isAuto) {
                // In auto mode (postinstall), back up and overwrite
                const backupPath = getBackupName(target);
                if (isDryRun) {
                    console.log(`[dry-run] Would back up: ${file} → ${backupPath}`);
                    console.log(`[dry-run] Would overwrite: ${file}`);
                } else {
                    renameSync(target, backupPath);
                    copyFileSync(source, target);
                    console.log(`  ↪ Backed up existing ${file} → ${backupPath.split("/").pop()}`);
                }
                backed++;
                copied++;
            } else {
                // Interactive mode — ask user
                const answer = await prompt(
                    `  ${file} already exists and differs. Overwrite? (y/n/d=diff) `,
                );

                if (answer === "d") {
                    console.log(`\n--- Package version (new) ---`);
                    console.log(sourceContent.slice(0, 500) + (sourceContent.length > 500 ? "\n..." : ""));
                    console.log(`\n--- Existing (current) ---`);
                    console.log(targetContent.slice(0, 500) + (targetContent.length > 500 ? "\n..." : ""));
                    console.log();

                    const confirm = await prompt(`  Overwrite ${file}? (y/n) `);
                    if (confirm !== "y") {
                        skipped++;
                        continue;
                    }
                } else if (answer !== "y") {
                    skipped++;
                    continue;
                }

                const backupPath = getBackupName(target);
                if (isDryRun) {
                    console.log(`[dry-run] Would back up and overwrite: ${file}`);
                } else {
                    renameSync(target, backupPath);
                    copyFileSync(source, target);
                    console.log(`  ↪ Backed up → ${backupPath.split("/").pop()}`);
                }
                backed++;
                copied++;
            }
        } else {
            if (isDryRun) {
                console.log(`[dry-run] Would copy: ${file}`);
            } else {
                copyFileSync(source, target);
            }
            copied++;
        }
    }

    console.log(
        `@null_void_undefined/claude-architecture-prompts: ${copied} copied, ${backed} backed up, ${skipped} skipped → ${targetDir}`,
    );
}

run().catch((err) => {
    console.error("@null_void_undefined/claude-architecture-prompts:", err.message);
    process.exit(1);
});
