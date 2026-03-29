#!/usr/bin/env node

import {
    existsSync,
    copyFileSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    readdirSync,
    renameSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIGS_DIR = resolve(__dirname, "..", "configs");

const isAuto = process.argv.includes("--auto");
const isDryRun = process.argv.includes("--dry-run");
const skipInstall = process.argv.includes("--skip-install");

const PKG_NAME = "@null_void_undefined/formatting-configs";

const SCRIPTS_TO_ADD = {
    format: 'prettier --write "**/*.{js,jsx,ts,tsx,json,css,scss,md}"',
    "format:check": 'prettier --check "**/*.{js,jsx,ts,tsx,json,css,scss,md}"',
    lint: "eslint .",
    "lint:fix": "eslint . --fix",
};

const PEER_DEPS = {
    "@trivago/prettier-plugin-sort-imports": "^4",
    "@typescript-eslint/parser": "^8",
    eslint: "^9.0.0",
    "eslint-config-prettier": "^10",
    "eslint-plugin-security": "^3",
    "eslint-plugin-unused-imports": "^4",
    globals: "^15",
    prettier: "^3",
    "typescript-eslint": "^8",
};

// React-related deps — only installed if project uses React
const REACT_PEER_DEPS = {
    "@babel/eslint-parser": "^7",
    "eslint-plugin-jsx-a11y": "^6",
    "eslint-plugin-react": "^7",
    "eslint-plugin-react-hooks": "^5",
};

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

function detectPackageManager(projectRoot) {
    if (existsSync(join(projectRoot, "pnpm-lock.yaml"))) {
        return "pnpm";
    }
    if (existsSync(join(projectRoot, "yarn.lock"))) {
        return "yarn";
    }
    if (existsSync(join(projectRoot, "bun.lockb")) || existsSync(join(projectRoot, "bun.lock"))) {
        return "bun";
    }
    return "npm";
}

function projectUsesReact(projectRoot) {
    try {
        const pkg = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        return "react" in allDeps || "next" in allDeps;
    } catch {
        return false;
    }
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

async function copyConfigFiles(projectRoot) {
    const configFiles = readdirSync(CONFIGS_DIR);
    let copied = 0;
    let backed = 0;
    let skipped = 0;

    for (const file of configFiles) {
        const source = join(CONFIGS_DIR, file);
        const target = join(projectRoot, file);

        if (existsSync(target)) {
            const sourceContent = readFileSync(source, "utf8");
            const targetContent = readFileSync(target, "utf8");

            if (sourceContent === targetContent) {
                skipped++;
                continue;
            }

            if (isAuto) {
                const backupPath = getBackupName(target);
                if (!isDryRun) {
                    renameSync(target, backupPath);
                    copyFileSync(source, target);
                    console.log(`  ↪ Backed up existing ${file} → ${backupPath.split("/").pop()}`);
                }
                backed++;
                copied++;
            } else {
                const answer = await prompt(`  ${file} already exists and differs. Overwrite? (y/n) `);
                if (answer !== "y") {
                    skipped++;
                    continue;
                }

                const backupPath = getBackupName(target);
                if (!isDryRun) {
                    renameSync(target, backupPath);
                    copyFileSync(source, target);
                    console.log(`  ↪ Backed up → ${backupPath.split("/").pop()}`);
                }
                backed++;
                copied++;
            }
        } else {
            if (!isDryRun) {
                copyFileSync(source, target);
            }
            copied++;
        }
    }

    console.log(`${PKG_NAME}: ${copied} config(s) copied, ${backed} backed up, ${skipped} unchanged`);
}

function updatePackageJsonScripts(projectRoot) {
    const pkgPath = join(projectRoot, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

    if (!pkg.scripts) {
        pkg.scripts = {};
    }

    let added = 0;
    for (const [name, command] of Object.entries(SCRIPTS_TO_ADD)) {
        if (!pkg.scripts[name]) {
            pkg.scripts[name] = command;
            added++;
        }
    }

    if (added > 0) {
        if (!isDryRun) {
            writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + "\n", "utf8");
        }
        console.log(`${PKG_NAME}: Added ${added} script(s) to package.json (format, format:check, lint, lint:fix)`);
    } else {
        console.log(`${PKG_NAME}: All formatting scripts already present in package.json`);
    }
}

function installMissingPeers(projectRoot) {
    const pkgPath = join(projectRoot, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    const usesReact = projectUsesReact(projectRoot);
    const requiredDeps = { ...PEER_DEPS, ...(usesReact ? REACT_PEER_DEPS : {}) };

    const missing = Object.entries(requiredDeps)
        .filter(([name]) => !(name in allDeps))
        .map(([name, version]) => `${name}@${version}`);

    if (missing.length === 0) {
        console.log(`${PKG_NAME}: All peer dependencies already installed`);
        return;
    }

    const pm = detectPackageManager(projectRoot);
    const installCmd =
        pm === "yarn"
            ? `yarn add --dev ${missing.join(" ")}`
            : `${pm} add -D ${missing.join(" ")}`;

    console.log(`${PKG_NAME}: Installing ${missing.length} missing peer dep(s) with ${pm}...`);

    if (!isDryRun) {
        try {
            execSync(installCmd, { cwd: projectRoot, stdio: "inherit" });
        } catch {
            console.warn(`${PKG_NAME}: Peer dependency install failed. Run manually:\n  ${installCmd}`);
        }
    } else {
        console.log(`[dry-run] Would run: ${installCmd}`);
    }
}

async function run() {
    const cwd = process.env.INIT_CWD || process.cwd();
    const projectRoot = findProjectRoot(cwd);

    if (!projectRoot) {
        console.error(`${PKG_NAME}: Could not find project root (no package.json found).`);
        process.exit(1);
    }

    await copyConfigFiles(projectRoot);
    updatePackageJsonScripts(projectRoot);

    if (!skipInstall) {
        installMissingPeers(projectRoot);
    }
}

run().catch((err) => {
    console.error(`${PKG_NAME}:`, err.message);
    process.exit(1);
});
